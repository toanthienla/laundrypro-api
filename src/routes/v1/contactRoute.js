import express from 'express';
import { contactController } from '~/controllers/contactController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { contactValidation } from '~/validations/contactValidation';

const Router = express.Router();

Router.route('/')
  .post(contactValidation.sendContactMessage, contactController.sendContactMessage);

Router.route('/admin')
  .get(authMiddleware.isAuthorized, authMiddleware.isAdmin, contactController.getAllContacts);

Router.route('/admin/:id/status')
  .patch(authMiddleware.isAuthorized, authMiddleware.isAdmin, contactValidation.updateContactStatus, contactController.updateStatus);

export const contactRoute = Router;