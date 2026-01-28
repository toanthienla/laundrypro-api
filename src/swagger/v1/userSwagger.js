/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         phone:
 *           type: string
 *           description: Phone in E.164 format
 *           example: "+84901234567"
 *         firebaseUid:
 *           type: string
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [customer, staff, admin]
 *         address:
 *           type: string
 *         avatar:
 *           type: string
 *         isVerified:
 *           type: boolean
 *         hasPassword:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [active, suspended]
 *         note:
 *           type: string
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ==================== AUTH ====================

/**
 * @swagger
 * /v1/users/check-login:
 *   post:
 *     summary: Check login method for phone
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone in E.164 format
 *                 example: "+84901234567"
 *     responses:
 *       200:
 *         description: Login method info
 *       403:
 *         description: Account suspended
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /v1/users/login/otp:
 *   post:
 *     summary: Login with Firebase OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid token
 *       403:
 *         description: Account suspended
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /v1/users/login/password:
 *   post:
 *     summary: Login with password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+84901234567"
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Not verified or suspended
 *       404:
 *         description: Account not found
 */

/**
 * @swagger
 * /v1/users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Token refreshed
 *       403:
 *         description: Invalid refresh token
 */

/**
 * @swagger
 * /v1/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Logout successful
 */

// ==================== PASSWORD ====================

/**
 * @swagger
 * /v1/users/password:
 *   post:
 *     summary: Set password (first time)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password set
 *       403:
 *         description: Not verified
 *
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Incorrect current password
 *
 *   delete:
 *     summary: Remove password (OTP only)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password removed
 *       401:
 *         description: Incorrect password
 */

// ==================== PROFILE ====================

/**
 * @swagger
 * /v1/users/profile:
 *   get:
 *     summary: Get my profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Success
 *       401:
 *         description: Unauthorized
 *
 *   put:
 *     summary: Update my profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */

// ==================== CUSTOMERS (Staff/Admin) ====================

/**
 * @swagger
 * /v1/users/customers/search:
 *   get:
 *     summary: Find customer by phone (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         example: "+84901234567"
 *     responses:
 *       200:
 *         description: Customer found or null
 *       403:
 *         description: Staff/Admin required
 */

/**
 * @swagger
 * /v1/users/customers:
 *   get:
 *     summary: Get all customers (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
 *       403:
 *         description: Staff/Admin required
 *
 *   post:
 *     summary: Create customer (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+84901234567"
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 *       403:
 *         description: Staff/Admin required
 *       409:
 *         description: Phone exists
 */

/**
 * @swagger
 * /v1/users/customers/{id}:
 *   get:
 *     summary: Get customer by ID (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Update customer (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Customer updated
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /v1/users/customers/{id}/history:
 *   get:
 *     summary: Get customer with order history (Staff/Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer with orders
 *       404:
 *         description: Not found
 */

// ==================== USERS (Admin) ====================

/**
 * @swagger
 * /v1/users/users:
 *   get:
 *     summary: Get all users (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, staff, admin]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended]
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin required
 */

/**
 * @swagger
 * /v1/users/users/staff:
 *   post:
 *     summary: Create staff (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+84901234567"
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Staff created
 *       403:
 *         description: Admin required
 *       409:
 *         description: Phone exists
 */

/**
 * @swagger
 * /v1/users/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete user (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Has existing orders
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /v1/users/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, staff, admin]
 *     responses:
 *       200:
 *         description: Role updated
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /v1/users/users/{id}/status:
 *   patch:
 *     summary: Update user status (Admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Not found
 */