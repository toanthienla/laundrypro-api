import express from 'express';
import { serviceController } from '~/controllers/serviceController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';
import { serviceValidation } from '~/validations/serviceValidation';

const Router = express.Router();

// Centralized middleware combinations
const adminAuth = [authMiddleware.isAuthorized, authMiddleware.isAdmin];

// ============== PUBLIC ==============

Router.route('/')
  .get(serviceController.getAllServices)
  .post(adminAuth, multerMiddleware.upload.single('image'), serviceValidation.createService, serviceController.createService);

Router.route('/categories')
  .get(serviceController.getCategories);

Router.route('/:id')
  .get(serviceController.getServiceById)
  .put(adminAuth, multerMiddleware.upload.single('image'), serviceValidation.updateService, serviceController.updateService)
  .delete(adminAuth, serviceController.deleteService);

export const serviceRoute = Router;