import express from 'express';
import { paymentController } from '~/controllers/paymentController';
import { paymentValidation } from '~/validations/paymentValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();

// Webhook endpoints (public - no auth, validated by signature in real implementation)
Router.route('/webhook/momo')
  .post(
    paymentValidation.webhook,
    paymentController.handleWebhook
  );

Router.route('/webhook/vnpay')
  .post(
    paymentValidation.webhook,
    paymentController.handleWebhook
  );

// Protected routes
Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    paymentValidation.createPayment,
    paymentController.createPayment
  )
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    paymentValidation.getAllPayments,
    paymentController.getAllPayments
  );

Router.route('/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    paymentValidation.validatePaymentId,
    paymentController.getPaymentById
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    paymentValidation.validatePaymentId,
    paymentController.deletePayment
  );

Router.route('/:id/status')
  .patch(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    paymentValidation.validatePaymentId,
    paymentValidation.updatePaymentStatus,
    paymentController.updatePaymentStatus
  );

// Get payments by order (useful for both customer and staff)
Router.route('/by-order/:orderId')
  .get(
    authMiddleware.isAuthorized,
    paymentValidation.validateOrderId,
    paymentController.getPaymentsByOrderId
  );

export const paymentRoute = Router;