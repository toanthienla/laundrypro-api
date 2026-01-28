import express from 'express';
import { userController } from '~/controllers/userController';
import { userValidation } from '~/validations/userValidation';
import { authMiddleware } from '~/middlewares/authMiddleware';
import { multerMiddleware } from '~/middlewares/multerMiddleware';

const Router = express.Router();

// ==================== AUTH (Public) ====================

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

// ==================== PASSWORD (Authenticated) ====================

Router.route('/password')
  .post(
    authMiddleware.isAuthorized,
    userValidation.setPassword,
    userController.setPassword
  )
  .put(
    authMiddleware.isAuthorized,
    userValidation.changePassword,
    userController.changePassword
  )
  .delete(
    authMiddleware.isAuthorized,
    userValidation.removePassword,
    userController.removePassword
  );

// ==================== PROFILE (Authenticated) ====================

Router.route('/profile')
  .get(authMiddleware.isAuthorized, userController.getProfile)
  .put(
    authMiddleware.isAuthorized,
    multerMiddleware.upload.single('avatar'),
    userValidation.updateProfile,
    userController.updateProfile
  );

// ==================== CUSTOMERS (Staff/Admin) ====================

Router.route('/customers/search')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userValidation.findCustomerByPhone,
    userController.findCustomerByPhone
  );

Router.route('/customers')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userController.getAllCustomers
  )
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userValidation.createCustomer,
    userController.createCustomer
  );

Router.route('/customers/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userValidation.validateId,
    userController.getCustomerById
  )
  .put(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userValidation.validateId,
    userValidation.updateCustomer,
    userController.updateCustomer
  );

Router.route('/customers/:id/history')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isStaffOrAdmin,
    userValidation.validateId,
    userController.getCustomerWithHistory
  );

// ==================== USERS (Admin) ====================

Router.route('/users')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userController.getAllUsers
  );

Router.route('/users/staff')
  .post(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.createStaff,
    userController.createStaff
  );

Router.route('/users/:id')
  .get(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateId,
    userController.getUserById
  )
  .delete(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateId,
    userController.deleteUser
  );

Router.route('/users/:id/role')
  .patch(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateId,
    userValidation.updateUserRole,
    userController.updateUserRole
  );

Router.route('/users/:id/status')
  .patch(
    authMiddleware.isAuthorized,
    authMiddleware.isAdmin,
    userValidation.validateId,
    userValidation.updateUserStatus,
    userController.updateUserStatus
  );

export const userRoute = Router;