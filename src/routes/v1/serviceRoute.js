import express from 'express';
import { serviceController } from '~/controllers/serviceController';
import { serviceValidation } from '~/validations/serviceValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';

const Router = express.Router();

// ============== PUBLIC ==============
Router.route('/')
  .get(serviceController.getAllServices);

Router.route('/categories')
  .get(serviceController.getCategories);

Router.route('/:id')
  .get(serviceValidation.validateId, serviceController.getServiceById);

// ============== ADMIN ONLY ==============
Router.route('/')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    multerMiddleware.upload.single('image'),
    serviceValidation.createService,
    serviceController.createService
  );

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    serviceValidation.validateId,
    multerMiddleware.upload.single('image'),
    serviceValidation.updateService,
    serviceController.updateService
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    serviceValidation.validateId,
    serviceController.deleteService
  );

export const serviceRoute = Router;