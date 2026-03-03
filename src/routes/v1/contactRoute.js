import express from 'express';
import { contactController } from '~/controllers/contactController';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router();

Router.route('/')
  .post(contactController.sendContactMessage);

Router.route('/admin')
  .get(authMiddleware.isAuthorized, authMiddleware.isAdmin, contactController.getAllContacts);

export const contactRoute = Router;