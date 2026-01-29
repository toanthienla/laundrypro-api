import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Payment, PAYMENT_STATUS, PAYMENT_METHOD } from '~/models/paymentModel';
import { Order, ORDER_STATUS } from '~/models/orderModel';
import ApiError from '~/utils/ApiError';

// Helper to recalculate order paid amount
const recalculateOrderPaidAmount = async (orderId) => {
  const totalPaid = await Payment.getTotalPaidByOrderId(orderId);
  await Order.updateOrder(orderId, { paidAmount: totalPaid });
  return totalPaid;
};

const createPayment = async (reqBody, userRole) => {
  const { orderId, method, amount, transactionRef } = reqBody;

  // Validate order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  // Validate amount
  if (amount <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment amount must be greater than 0.');
  }

  // Staff cannot create payment for completed orders
  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot create payment for completed orders.');
  }

  // Check if paid amount would exceed total price (optional business rule)
  const currentPaid = await Payment.getTotalPaidByOrderId(orderId);
  if (currentPaid + amount > order.totalPrice) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Payment amount exceeds remaining balance. Remaining: ${order.totalPrice - currentPaid}`
    );
  }

  const paymentData = {
    orderId,
    method,
    amount,
    status: PAYMENT_STATUS.PENDING,
    transactionRef: transactionRef || null,
    paidAt: null
  };

  // Cash payments can be marked as paid immediately (if specified)
  if (method === PAYMENT_METHOD.CASH && reqBody.markAsPaid) {
    paymentData.status = PAYMENT_STATUS.PAID;
    paymentData.paidAt = new Date();
  }

  const payment = await Payment.createPayment(paymentData);

  // If marked as paid immediately, update order
  if (paymentData.status === PAYMENT_STATUS.PAID) {
    await recalculateOrderPaidAmount(orderId);
  }

  return payment;
};

const getPaymentsByOrderId = async (orderId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  const filter = { orderId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Payment.countDocuments(filter)
  ]);

  // Calculate remaining balance
  const totalPaid = await Payment.getTotalPaidByOrderId(orderId);

  return {
    payments,
    orderSummary: {
      totalPrice: order.totalPrice,
      totalPaid,
      remaining: order.totalPrice - totalPaid
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate('orderId', 'totalPrice paidAmount status');

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
  }

  return payment;
};

const getAllPayments = async (query = {}) => {
  const { orderId, status, method, startDate, endDate, page = 1, limit = 10 } = query;
  const filter = {};

  if (orderId) filter.orderId = orderId;
  if (status) filter.status = status;
  if (method) filter.method = method;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('orderId', 'customerId totalPrice status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Payment.countDocuments(filter)
  ]);

  return {
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const updatePaymentStatus = async (paymentId, status, transactionRef, userRole) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
  }

  // Prevent modification of already refunded payments
  if (payment.status === PAYMENT_STATUS.REFUNDED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot modify refunded payment.');
  }

  // Only admin can refund
  if (status === PAYMENT_STATUS.REFUNDED && userRole !== 'admin') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can process refunds.');
  }

  // Validate transition logic
  if (payment.status === PAYMENT_STATUS.PAID && status === PAYMENT_STATUS.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot revert paid payment to pending.');
  }

  const updateData = { status };

  if (status === PAYMENT_STATUS.PAID) {
    updateData.paidAt = new Date();
    if (transactionRef) updateData.transactionRef = transactionRef;
  } else if (status === PAYMENT_STATUS.FAILED || status === PAYMENT_STATUS.PENDING) {
    updateData.paidAt = null;
  }

  const updatedPayment = await Payment.updatePayment(paymentId, updateData);

  // Recalculate order paid amount
  await recalculateOrderPaidAmount(payment.orderId);

  return updatedPayment;
};

const deletePayment = async (paymentId, userRole) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
  }

  // Only admin can delete paid payments
  if (userRole !== 'admin' && payment.status === PAYMENT_STATUS.PAID) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can delete paid payments.');
  }

  // Prevent deleting refunded payments
  if (payment.status === PAYMENT_STATUS.REFUNDED) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot delete refunded payment.');
  }

  await Payment.deletePayment(paymentId);

  // Recalculate order paid amount after deletion
  await recalculateOrderPaidAmount(payment.orderId);
};

// For MoMo/VNPay webhooks - idempotent operation
const confirmPaymentByTransactionRef = async (transactionRef, gatewayData = {}) => {
  const payment = await Payment.findByTransactionRef(transactionRef);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found for this transaction.');
  }

  if (payment.status === PAYMENT_STATUS.PAID) {
    // Idempotent - already processed
    return payment;
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `Payment is already ${payment.status}.`);
  }

  const updatedPayment = await Payment.updatePayment(payment._id, {
    status: PAYMENT_STATUS.PAID,
    paidAt: new Date(),
    ...gatewayData
  });

  await recalculateOrderPaidAmount(payment.orderId);

  return updatedPayment;
};

export const paymentService = {
  createPayment,
  getPaymentsByOrderId,
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
  deletePayment,
  confirmPaymentByTransactionRef
};