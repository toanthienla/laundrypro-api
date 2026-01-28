import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Order, ORDER_STATUS } from '~/models/orderModel';
import { OrderItem } from '~/models/orderItemModel';
import { User, USER_ROLES } from '~/models/userModel';
import { Service } from '~/models/serviceModel';
import ApiError from '~/utils/ApiError';

// ==================== CUSTOMER ====================

const getMyOrders = async (userId, query = {}) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = { customerId: userId };

  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('createdBy', 'phone name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.findByOrderId(order._id);
      return { ...order.toObject(), orderItems };
    })
  );

  return {
    orders: ordersWithItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getMyOrderById = async (orderId, userId) => {
  const order = await Order.findOne({ _id: orderId, customerId: userId })
    .populate('createdBy', 'phone name');

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  const orderItems = await OrderItem.findByOrderId(orderId);

  return { ...order.toObject(), orderItems };
};

// ==================== STAFF/ADMIN ====================

const createOrder = async (reqBody, createdByUserId) => {
  const { customerPhone, customerName, customerAddress, items, note } = reqBody;

  // Find or create customer
  const customer = await User.findOrCreateCustomer(customerPhone, customerName, customerAddress);

  // Validate and prepare order items
  const orderItems = [];
  let totalPrice = 0;

  for (const item of items) {
    const service = await Service.findOneById(item.serviceId);

    if (!service) {
      throw new ApiError(StatusCodes.NOT_FOUND, `Service not found: ${item.serviceId}`);
    }

    if (!service.active) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Service is not active: ${service.name}`);
    }

    // Use service.price as default if unitPrice not provided
    const unitPrice = item.unitPrice !== undefined ? item.unitPrice : service.price;
    const itemTotal = item.quantity * unitPrice;

    orderItems.push({
      serviceId: service._id,
      serviceName: service.name,
      serviceCategory: service.category,
      servicePrice: service.price, // Snapshot original price
      serviceUnit: service.unit,
      quantity: item.quantity,
      unitPrice: unitPrice, // Actual charged price
      totalPrice: itemTotal,
      note: item.note || null
    });

    totalPrice += itemTotal;
  }

  // Create order
  const order = await Order.create({
    customerId: customer._id,
    createdBy: createdByUserId,
    status: ORDER_STATUS.PENDING,
    totalPrice,
    note: note || null
  });

  // Create order items
  for (const itemData of orderItems) {
    await OrderItem.createItem({
      orderId: order._id,
      ...itemData
    });
  }

  // Get complete order with items
  const completeOrder = await Order.findById(order._id)
    .populate('customerId', 'phone name address')
    .populate('createdBy', 'phone name');

  const savedItems = await OrderItem.findByOrderId(order._id);

  return {
    ...completeOrder.toObject(),
    orderItems: savedItems
  };
};

const getOrdersByCustomerPhone = async (phone, query = {}) => {
  const { status, page = 1, limit = 10 } = query;

  const customer = await User.findByPhone(phone);

  if (!customer) {
    return {
      customer: null,
      orders: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        totalPages: 0
      }
    };
  }

  const filter = { customerId: customer._id };
  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('createdBy', 'phone name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.findByOrderId(order._id);
      return { ...order.toObject(), orderItems };
    })
  );

  return {
    customer,
    orders: ordersWithItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getAllOrders = async (query = {}) => {
  const { status, customerId, createdBy, customerPhone, page = 1, limit = 10, startDate, endDate } = query;
  const filter = {};

  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (createdBy) filter.createdBy = createdBy;

  if (customerPhone) {
    const customer = await User.findByPhone(customerPhone);
    if (customer) {
      filter.customerId = customer._id;
    } else {
      return {
        orders: [],
        pagination: { page: parseInt(page), limit: parseInt(limit), total: 0, totalPages: 0 }
      };
    }
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('customerId', 'phone name address')
      .populate('createdBy', 'phone name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter)
  ]);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const orderItems = await OrderItem.findByOrderId(order._id);
      return { ...order.toObject(), orderItems };
    })
  );

  return {
    orders: ordersWithItems,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  };
};

const getOrderById = async (orderId) => {
  const order = await Order.findById(orderId)
    .populate('customerId', 'phone name address email')
    .populate('createdBy', 'phone name');

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  const orderItems = await OrderItem.findByOrderId(orderId);

  return { ...order.toObject(), orderItems };
};

const updateOrder = async (orderId, reqBody, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  // Staff can only update pending orders
  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can modify completed orders.');
  }

  const updateData = {};
  if (reqBody.note !== undefined) updateData.note = reqBody.note;

  const updatedOrder = await Order.updateOrder(orderId, updateData);
  const orderItems = await OrderItem.findByOrderId(orderId);

  return { ...updatedOrder.toObject(), orderItems };
};

const updateOrderStatus = async (orderId, status, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  // Staff can only update pending orders
  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can modify completed orders.');
  }

  const updateData = { status };

  if (status === ORDER_STATUS.COMPLETED) {
    updateData.completedAt = new Date();
  } else {
    updateData.completedAt = null;
  }

  const updatedOrder = await Order.updateOrder(orderId, updateData);
  const orderItems = await OrderItem.findByOrderId(orderId);

  return { ...updatedOrder.toObject(), orderItems };
};

const deleteOrder = async (orderId, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  // Staff can only delete pending orders
  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can delete completed orders.');
  }

  // Delete order items first
  await OrderItem.deleteByOrderId(orderId);

  // Delete order
  await Order.deleteOrder(orderId);
};

const getOrderStats = async (query = {}) => {
  const { startDate, endDate } = query;
  const matchFilter = {};

  if (startDate || endDate) {
    matchFilter.createdAt = {};
    if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
    if (endDate) matchFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  // Stats by status
  const byStatus = await Order.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Total revenue (completed orders only)
  const completedFilter = { ...matchFilter, status: ORDER_STATUS.COMPLETED };
  const revenueResult = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const revenue = revenueResult.length > 0 ? revenueResult[0] : { totalRevenue: 0, totalOrders: 0 };
  revenue.avgOrderValue = revenue.totalOrders > 0 ? revenue.totalRevenue / revenue.totalOrders : 0;

  // Daily stats
  const daily = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 30 }
  ]);

  // Top customers
  const topCustomers = await Order.aggregate([
    { $match: completedFilter },
    {
      $group: {
        _id: '$customerId',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' }
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'customer'
      }
    },
    { $unwind: '$customer' },
    {
      $project: {
        customerId: '$_id',
        name: '$customer.name',
        phone: '$customer.phone',
        totalOrders: 1,
        totalSpent: 1
      }
    }
  ]);

  return {
    byStatus,
    revenue,
    daily,
    topCustomers
  };
};

// ==================== ORDER ITEMS ====================

const addOrderItem = async (orderId, reqBody, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can modify completed orders.');
  }

  const service = await Service.findOneById(reqBody.serviceId);

  if (!service) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Service not found.');
  }

  if (!service.active) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Service is not active.');
  }

  // Use service.price as default if unitPrice not provided
  const unitPrice = reqBody.unitPrice !== undefined ? reqBody.unitPrice : service.price;

  const itemData = {
    orderId: order._id,
    serviceId: service._id,
    serviceName: service.name,
    serviceCategory: service.category,
    servicePrice: service.price,
    serviceUnit: service.unit,
    quantity: reqBody.quantity,
    unitPrice: unitPrice,
    totalPrice: reqBody.quantity * unitPrice,
    note: reqBody.note || null
  };

  await OrderItem.createItem(itemData);

  // Recalculate order total
  const newTotal = await OrderItem.calculateOrderTotal(orderId);
  await Order.updateOrder(orderId, { totalPrice: newTotal });

  // Return updated order
  return getOrderById(orderId);
};

const updateOrderItem = async (orderId, itemId, reqBody, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can modify completed orders.');
  }

  const item = await OrderItem.findOneById(itemId);

  if (!item || item.orderId.toString() !== orderId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order item not found.');
  }

  const updateData = {};
  if (reqBody.quantity !== undefined) updateData.quantity = reqBody.quantity;
  if (reqBody.unitPrice !== undefined) updateData.unitPrice = reqBody.unitPrice;
  if (reqBody.note !== undefined) updateData.note = reqBody.note;

  await OrderItem.updateItem(itemId, updateData);

  // Recalculate order total
  const newTotal = await OrderItem.calculateOrderTotal(orderId);
  await Order.updateOrder(orderId, { totalPrice: newTotal });

  // Return updated order
  return getOrderById(orderId);
};

const deleteOrderItem = async (orderId, itemId, userRole) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found.');
  }

  if (userRole !== 'admin' && order.status === ORDER_STATUS.COMPLETED) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Only admin can modify completed orders.');
  }

  const item = await OrderItem.findOneById(itemId);

  if (!item || item.orderId.toString() !== orderId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Order item not found.');
  }

  await OrderItem.deleteItem(itemId);

  // Recalculate order total
  const newTotal = await OrderItem.calculateOrderTotal(orderId);
  await Order.updateOrder(orderId, { totalPrice: newTotal });

  // Return updated order
  return getOrderById(orderId);
};

export const orderService = {
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