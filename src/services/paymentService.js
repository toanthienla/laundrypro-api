import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Payment, PAYMENT_STATUS, PAYMENT_METHOD } from '~/models/paymentModel';
import { Order, ORDER_STATUS } from '~/models/orderModel';
import ApiError from '~/utils/ApiError';

const createPayment = async (reqBody, userRole) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { orderId, method, amount, transactionRef } = reqBody;

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
    }

    const existingPayment = await Payment.findByOrderId(orderId).session(session);
    if (existingPayment) {
      if (existingPayment.status === PAYMENT_STATUS.PAID) {
        throw new ApiError(
          StatusCodes.CONFLICT,
          'Order already has a payment. Use update instead.'
        );
      }

      await Payment.deleteByOrderId(orderId, session);
    }

    if (order.status === ORDER_STATUS.COMPLETED) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Cannot create payment for completed orders.');
    }

    if (amount !== order.totalPrice) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Payment amount (${amount}) must equal order total (${order.totalPrice}).`
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

    if (method === PAYMENT_METHOD.CASH && reqBody.markAsPaid) {
      paymentData.status = PAYMENT_STATUS.PAID;
      paymentData.paidAt = new Date();
    }

    const [payment] = await Payment.createPayment(paymentData, session);

    if (paymentData.status === PAYMENT_STATUS.PAID) {
      await Order.findByIdAndUpdate(
        orderId,
        { $set: { status: ORDER_STATUS.COMPLETED, completedAt: new Date() } },
        { session }
      );
    }

    await session.commitTransaction();
    return payment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getPaymentById = async (paymentId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
  }

  return payment;
};

const getPaymentByOrderId = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  const payment = await Payment.findByOrderId(orderId);

  return {
    order: {
      _id: order._id,
      totalPrice: order.totalPrice,
      status: order.status
    },
    payment: payment || null
  };
};

const getAllPayments = async (query = {}) => {
  const { orderId, status, method, search, page = 1, limit = 10, startDate, endDate } = query;
  const filter = {};

  if (orderId) filter.orderId = orderId;
  if (status) filter.status = status;
  if (method) filter.method = method;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  if (search) {
    filter.$or = [
      { transactionRef: { $regex: search, $options: 'i' } },
      { $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: search, options: 'i' } } },
      { $expr: { $regexMatch: { input: { $toString: '$orderId' }, regex: search, options: 'i' } } }
    ];
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }

    if (payment.status === PAYMENT_STATUS.REFUNDED) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot modify refunded payment.');
    }

    if (status === PAYMENT_STATUS.REFUNDED && userRole !== 'admin') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can process refunds.');
    }

    if (payment.status === PAYMENT_STATUS.PAID && status === PAYMENT_STATUS.PENDING) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot revert paid payment to pending.');
    }

    const updatedPayment = await Payment.updateStatus(paymentId, status, transactionRef, session);

    if (status === PAYMENT_STATUS.PAID) {
      const order = await Order.findById(payment.orderId).session(session);
      if (order && order.status !== ORDER_STATUS.COMPLETED) {
        await Order.findByIdAndUpdate(
          payment.orderId,
          { $set: { status: ORDER_STATUS.COMPLETED, completedAt: new Date() } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updatePaymentMethod = async (paymentId, method, userRole) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }

    // Only allow updating method for pending payments
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Cannot update method for ${payment.status} payment. Only pending payments can be modified.`
      );
    }

    // Validate method
    if (!Object.values(PAYMENT_METHOD).includes(method)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid payment method.');
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      { $set: { method } },
      { new: true, runValidators: true, session }
    );

    await session.commitTransaction();
    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deletePayment = async (paymentId, userRole) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }

    if (userRole !== 'admin' && payment.status === PAYMENT_STATUS.PAID) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can delete paid payments.');
    }

    await Payment.deletePayment(paymentId, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const confirmPaymentByTransactionRef = async (transactionRef, gatewayData = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findOne({ transactionRef }).session(session);

    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found.');
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      await session.commitTransaction();
      return payment;
    }

    const updatedPayment = await Payment.updateStatus(
      payment._id,
      PAYMENT_STATUS.PAID,
      transactionRef,
      session
    );

    await Order.findByIdAndUpdate(
      payment.orderId,
      { $set: { status: ORDER_STATUS.COMPLETED, completedAt: new Date() } },
      { session }
    );

    await session.commitTransaction();
    return updatedPayment;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const paymentService = {
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  getAllPayments,
  updatePaymentStatus,
  updatePaymentMethod,
  deletePayment,
  confirmPaymentByTransactionRef
};