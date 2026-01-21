import express from 'express';
import { userValidation } from '~/validations/userValidation';
import { userController } from '~/controllers/userController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';

const Router = express.Router();

// Public routes
Router.post('/register', userValidation.register, userController.register);
Router.post('/verify-email', userValidation.verifyEmail, userController.verifyEmail);
Router.post('/login', userValidation.login, userController.login);
Router.post('/forgot-password', userValidation.forgotPassword, userController.forgotPassword);
Router.post('/reset-password', userValidation.resetPassword, userController.resetPassword);
Router.post('/refresh-token', userController.refreshToken);
Router.post('/logout', userController.logout);

// Protected routes (requires authentication)
Router.use(authMiddleware.isAuthorized);

Router.get('/profile', userController.getProfile);
Router.put(
  '/profile',
  multerMiddleware.upload.single('avatar'),
  userValidation.updateProfile,
  userController.updateProfile
);
Router.put('/change-password', userValidation.changePassword, userController.changePassword);

// Admin only routes
Router.use(authMiddleware.isAdmin);

Router.get('/', userController.getAllUsers);
Router.get('/:id', userController.getUserById);
Router.patch('/:id/status', userController.updateUserStatus);
Router.delete('/:id', userController.deleteUser);

export const userRoute = Router;