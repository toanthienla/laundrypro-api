import { StatusCodes } from 'http-status-codes';
import { orderService } from '~/services/orderService';

// ============== CUSTOMER ==============

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { status, page, limit } = req.query;
    const result = await orderService.getMyOrders(userId, { status, page, limit });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrderById = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id;
    const { id } = req.params;
    const result = await orderService.getMyOrderById(id, userId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ============== STAFF/ADMIN ==============

const createOrder = async (req, res, next) => {
  try {
    const createdByUserId = req.jwtDecoded._id;
    const result = await orderService.createOrder(req.body, createdByUserId);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Order created successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersByCustomerPhone = async (req, res, next) => {
  try {
    const { phone, status, page, limit } = req.query;
    const result = await orderService.getOrdersByCustomerPhone(phone, { status, page, limit });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, customerId, createdBy, customerPhone, page, limit, startDate, endDate } = req.query;
    const result = await orderService.getAllOrders({
      status,
      customerId,
      createdBy,
      customerPhone,
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

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderById(id);
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.jwtDecoded.role;
    const result = await orderService.updateOrder(id, req.body, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.jwtDecoded.role;
    const result = await orderService.updateOrderStatus(id, status, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order status updated successfully.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.jwtDecoded.role;
    await orderService.deleteOrder(id, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await orderService.getOrderStats({ startDate, endDate });
    res.status(StatusCodes.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// ============== ORDER ITEMS ==============

const addOrderItem = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userRole = req.jwtDecoded.role;
    const result = await orderService.addOrderItem(orderId, req.body, userRole);
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Item added to order.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderItem = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const userRole = req.jwtDecoded.role;
    const result = await orderService.updateOrderItem(orderId, itemId, req.body, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order item updated.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const deleteOrderItem = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.params;
    const userRole = req.jwtDecoded.role;
    const result = await orderService.deleteOrderItem(orderId, itemId, userRole);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order item removed.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  // Customer
  getMyOrders,
  getMyOrderById,
  // Staff/Admin
  createOrder,
  getOrdersByCustomerPhone,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  // Order Items
  addOrderItem,
  updateOrderItem,
  deleteOrderItem
};