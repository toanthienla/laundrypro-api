import express from 'express';
import { orderController } from '~/controllers/orderController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { orderValidation } from '~/validations/orderValidation';

const Router = express.Router();

// Centralized middleware combinations
const auth = authMiddleware.isAuthorized;
const staffAuth = [authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin];
const adminAuth = [authMiddleware.isAuthorized, authMiddleware.isAdmin];

Router.route('/my-orders')
  .get(auth, orderController.getMyOrders);

Router.route('/my-orders/:id')
  .get(auth, orderController.getMyOrderById);

Router.route('/')
  .post(staffAuth, orderValidation.createOrder, orderController.createOrder)
  .get(staffAuth, orderController.getAllOrders);

Router.route('/search')
  .get(staffAuth, orderController.getOrdersByCustomerPhone);

Router.route('/stats')
  .get(adminAuth, orderController.getOrderStats);

Router.route('/sync-missing-payments')
  .post(adminAuth, orderController.syncMissingPayments);

Router.route('/:id')
  .get(staffAuth, orderController.getOrderById)
  .put(staffAuth, orderValidation.updateOrder, orderController.updateOrder)
  .delete(staffAuth, orderController.deleteOrder);

Router.route('/:id/status')
  .patch(staffAuth, orderValidation.updateOrderStatus, orderController.updateOrderStatus);

Router.route('/:orderId/items')
  .post(staffAuth, orderValidation.addOrderItem, orderController.addOrderItem);

Router.route('/:orderId/items/:itemId')
  .put(staffAuth, orderValidation.updateOrderItem, orderController.updateOrderItem)
  .delete(staffAuth, orderController.deleteOrderItem);

export const orderRoute = Router;
