import express from 'express';
import { paymentController } from '~/controllers/paymentController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { paymentValidation } from '~/validations/paymentValidation';

const Router = express.Router();

// Centralized middleware combinations
const auth = authMiddleware.isAuthorized;
const staffAuth = [authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin];

// ============== WEBHOOK (Public) ==============

Router.route('/webhook/momo')
  .post(paymentController.handleWebhook);

Router.route('/webhook/vnpay')
  .post(paymentController.handleWebhook);

// ============== AUTHENTICATED ==============

Router.route('/my-payments')
  .get(auth, paymentController.getMyPayments);

Router.route('/by-order/:orderId')
  .get(auth, paymentController.getPaymentByOrderId);

// ============== STAFF/ADMIN ==============

Router.route('/')
  .post(staffAuth, paymentValidation.createPayment, paymentController.createPayment)
  .get(staffAuth, paymentController.getAllPayments);

Router.route('/:id')
  .get(staffAuth, paymentController.getPaymentById)
  .delete(staffAuth, paymentController.deletePayment);

Router.route('/:id/status')
  .patch(staffAuth, paymentValidation.updatePaymentStatus, paymentController.updatePaymentStatus);

Router.route('/:id/method')
  .patch(staffAuth, paymentValidation.updatePaymentMethod, paymentController.updatePaymentMethod);

export const paymentRoute = Router;