import { StatusCodes } from 'http-status-codes';
import { paymentService } from '~/services/paymentService';

const createPayment = async (req, res, next) => {
  try {
    const userRole = req.jwtDecoded.role;
    const result = await paymentService.createPayment(req.body, userRole);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Payment created successfully.',
      data: result
    });
  } catch (error) {
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { page, limit } = req.query;
    const result = await paymentService.getMyPayments(userId, { page, limit });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// FIXED: Singular name, removed pagination params
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const result = await paymentService.getPaymentByOrderId(orderId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await paymentService.getPaymentById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllPayments = async (req, res, next) => {
  try {
    const { orderId, status, method, search, page, limit, startDate, endDate } = req.query;
    const result = await paymentService.getAllPayments({
      orderId,
      status,
      method,
      search,
      page,
      limit,
      startDate,
      endDate
    });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, transactionRef } = req.body;
    const userRole = req.jwtDecoded.role;
    const result = await paymentService.updatePaymentStatus(id, status, transactionRef, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payment status updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentMethod = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { method } = req.body;
    const userRole = req.jwtDecoded.role;
    const result = await paymentService.updatePaymentMethod(id, method, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payment method updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.jwtDecoded.role;
    await paymentService.deletePayment(id, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Payment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// Webhook for payment gateways (MoMo, VNPay)
const handleWebhook = async (req, res, next) => {
  try {
    const { transactionRef, status, ...gatewayData } = req.body;

    // Immediate response to gateway
    res.status(StatusCodes.OK).json({ success: true });

    // Process asynchronously
    if (status === 'success' || req.body.resultCode === 0) {
      await paymentService.confirmPaymentByTransactionRef(transactionRef, {
        gatewayResponse: gatewayData
      });
    }
  } catch (error) {
    // Log error but don't send error response to gateway (already responded)
    console.error('Webhook processing error:', error);
  }
};

export const paymentController = {
  createPayment,
  getPaymentByOrderId,  // FIXED: Singular
  getPaymentById,
  getAllPayments,
  updatePaymentStatus,
  updatePaymentMethod,
  deletePayment,
  handleWebhook,
  getMyPayments
};