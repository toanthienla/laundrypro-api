import express from 'express';
import { serviceValidation } from '~/validations/serviceValidation';
import { serviceController } from '~/controllers/serviceController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';

const Router = express.Router();

// Public routes
Router.get('/', serviceController.getAllServices);
Router.get('/categories', serviceController.getCategories);
Router.get('/:id', serviceController.getServiceById);

// Admin only routes
Router.use(authMiddleware.isAuthorized);
Router.use(authMiddleware.isAdmin);

Router.post(
  '/',
  multerMiddleware.upload.single('image'),
  serviceValidation.createService,
  serviceController.createService
);
Router.put(
  '/: id',
  multerMiddleware.upload.single('image'),
  serviceValidation.updateService,
  serviceController.updateService
);
Router.delete('/:id', serviceController.deleteService);

export const serviceRoute = Router;