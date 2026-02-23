import express from 'express';
import { paymentController } from '~/controllers/paymentController';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();

// Centralized middleware combinations
const auth = authMiddleware.isAuthorized;
const staffAuth = [authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin];

// ============== WEBHOOK (Public) ==============

Router.route('/webhook/momo')
  .post(paymentController.handleWebhook);

Router.route('/webhook/vnpay')
  .post(paymentController.handleWebhook);

// ============== STAFF/ADMIN ==============

Router.route('/')
  .post(staffAuth, paymentController.createPayment)
  .get(staffAuth, paymentController.getAllPayments);

Router.route('/:id')
  .get(staffAuth, paymentController.getPaymentById)
  .delete(staffAuth, paymentController.deletePayment);

Router.route('/:id/status')
  .patch(staffAuth, paymentController.updatePaymentStatus);

Router.route('/:id/method')
  .patch(staffAuth, paymentController.updatePaymentMethod);

// ============== AUTHENTICATED ==============

Router.route('/by-order/:orderId')
  .get(auth, paymentController.getPaymentByOrderId);

export const paymentRoute = Router;