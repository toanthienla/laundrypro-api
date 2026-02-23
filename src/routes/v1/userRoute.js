import express from 'express';
import { userController } from '~/controllers/userController';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';

const Router = express.Router();

// Centralized middleware combinations
const auth = authMiddleware.isAuthorized;
const staffAuth = [authMiddleware.isAuthorized, authMiddleware.isStaffOrAdmin];
const adminAuth = [authMiddleware.isAuthorized, authMiddleware.isAdmin];

// ==================== PUBLIC ====================

Router.route('/check-login')
  .post(userController.checkLoginMethod);

Router.route('/login/otp')
  .post(userController.loginWithOTP);

Router.route('/login/password')
  .post(userController.loginWithPassword);

Router.route('/refresh-token')
  .post(userController.refreshToken);

Router.route('/logout')
  .post(userController.logout);

// ==================== PASSWORD (Authenticated) ====================

Router.route('/password')
  .post(auth, userController.setPassword)
  .put(auth, userController.changePassword)
  .delete(auth, userController.removePassword);

// ==================== PROFILE (Authenticated) ====================

Router.route('/profile')
  .get(auth, userController.getProfile)
  .put(auth, multerMiddleware.upload.single('avatar'), userController.updateProfile);

// ==================== CUSTOMERS (Staff/Admin) ====================

Router.route('/customers/search')
  .get(staffAuth, userController.findCustomerByPhone);

Router.route('/customers')
  .get(staffAuth, userController.getAllCustomers)
  .post(staffAuth, userController.createCustomer);

Router.route('/customers/:id')
  .get(staffAuth, userController.getCustomerById)
  .put(staffAuth, userController.updateCustomer);

Router.route('/customers/:id/history')
  .get(staffAuth, userController.getCustomerWithHistory);

// ==================== USERS (Admin) ====================

Router.route('/users')
  .get(adminAuth, userController.getAllUsers);

Router.route('/users/staff')
  .post(adminAuth, userController.createStaff);

Router.route('/users/:id')
  .get(adminAuth, userController.getUserById)
  .delete(adminAuth, userController.deleteUser);

Router.route('/users/:id/role')
  .patch(adminAuth, userController.updateUserRole);

Router.route('/users/:id/status')
  .patch(adminAuth, userController.updateUserStatus);

export const userRoute = Router;