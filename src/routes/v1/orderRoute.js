import express from 'express';
import { orderController } from '~/controllers/orderController';
import { orderValidation } from '~/validations/orderValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();

// ============== CUSTOMER ==============
Router.route('/my-orders')
  .get(
    authMiddleware.isAuthorized,
    orderController.getMyOrders
  );

Router.route('/my-orders/:id')
  .get(
    authMiddleware.isAuthorized,
    orderValidation.validateId,
    orderController.getMyOrderById
  );

// ============== STAFF/ADMIN ==============
Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.createOrder,
    orderController.createOrder
  )
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderController.getAllOrders
  );

Router.route('/search')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.getOrdersByCustomerPhone,
    orderController.getOrdersByCustomerPhone
  );

Router.route('/stats')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    orderController.getOrderStats
  );

Router.route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateId,
    orderController.getOrderById
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateId,
    orderValidation.updateOrder,
    orderController.updateOrder
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateId,
    orderController.deleteOrder
  );

Router.route('/:id/status')
  .patch(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateId,
    orderValidation.updateOrderStatus,
    orderController.updateOrderStatus
  );

// ============== ORDER ITEMS ==============
Router.route('/:orderId/items')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateOrderId,
    orderValidation.addOrderItem,
    orderController.addOrderItem
  );

Router.route('/:orderId/items/:itemId')
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateOrderItemIds,
    orderValidation.updateOrderItem,
    orderController.updateOrderItem
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    orderValidation.validateOrderItemIds,
    orderController.deleteOrderItem
  );

export const orderRoute = Router;