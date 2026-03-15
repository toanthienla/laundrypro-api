import express from 'express';
import { userController } from '~/controllers/userController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';
import { userValidation } from '~/validations/userValidation';

const Router = express.Router();

// Centralized middleware combinations
const auth = authMiddleware.isAuthorized;
const staffAuth = [authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin];
const adminAuth = [authMiddleware.isAuthorized, authMiddleware.isAdmin];

// ==================== PUBLIC ====================

Router.route('/check-login')
  .post(userValidation.checkLoginMethod, userController.checkLoginMethod);

Router.route('/login/otp')
  .post(userValidation.loginWithOTP, userController.loginWithOTP);

Router.route('/login/password')
  .post(userValidation.loginWithPassword, userController.loginWithPassword);

Router.route('/refresh-token')
  .post(userController.refreshToken);

Router.route('/logout')
  .post(userController.logout);

Router.route('/reset-password-otp')
  .post(userValidation.resetPasswordWithOTP, userController.resetPasswordWithOTP);

// ==================== PASSWORD (Authenticated) ====================

Router.route('/password')
  .post(auth, userValidation.setPassword, userController.setPassword)
  .put(auth, userValidation.changePassword, userController.changePassword)
  .delete(auth, userValidation.removePassword, userController.removePassword);

// ==================== PROFILE (Authenticated) ====================

Router.route('/profile')
  .get(auth, userController.getProfile)
  .put(auth, multerMiddleware.upload.single('avatar'), userValidation.updateProfile, userController.updateProfile);

// ==================== CUSTOMERS (Staff/Admin) ====================

Router.route('/customers/search')
  .get(staffAuth, userController.findCustomerByPhone);

Router.route('/customers')
  .get(staffAuth, userController.getAllCustomers)
  .post(staffAuth, userValidation.createCustomer, userController.createCustomer);

Router.route('/customers/:id')
  .get(staffAuth, userController.getCustomerById)
  .put(staffAuth, userValidation.updateCustomer, userController.updateCustomer);

Router.route('/customers/:id/history')
  .get(staffAuth, userController.getCustomerWithHistory);

// ==================== USERS (Admin) ====================

Router.route('/users')
  .get(adminAuth, userController.getAllUsers);

Router.route('/stats')
  .get(adminAuth, userController.getUserStats);

Router.route('/users/staff')
  .post(adminAuth, userValidation.createStaff, userController.createStaff);

Router.route('/users/:id')
  .get(adminAuth, userController.getUserById)
  .put(adminAuth, userValidation.updateStaff, userController.updateStaff)
  .delete(adminAuth, userController.deleteUser);

Router.route('/users/:id/role')
  .patch(adminAuth, userValidation.updateUserRole, userController.updateUserRole);

Router.route('/users/:id/status')
  .patch(adminAuth, userValidation.updateUserStatus, userController.updateUserStatus);

export const userRoute = Router;