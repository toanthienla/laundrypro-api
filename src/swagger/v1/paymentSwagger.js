/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment processing and management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderId:
 *           type: string
 *           description: Reference to order
 *         method:
 *           type: string
 *           enum: [cash, momo, vnpay, bank]
 *           example: "cash"
 *         amount:
 *           type: number
 *           description: Payment amount in VND
 *           example: 150000
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: "paid"
 *         transactionRef:
 *           type: string
 *           description: Transaction reference from payment gateway
 *           example: "MOMO250129123456"
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: When payment was confirmed
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ==================== PAYMENTS (Staff/Admin) ====================

/**
 * @swagger
 * /v1/payments:
 *   get:
 *     summary: Get all payments (Staff/Admin)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [cash, momo, vnpay, bank]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of payments with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *
 *   post:
 *     summary: Create payment (Staff/Admin)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     description: Create a payment record for an order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - method
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "65b12345..."
 *               method:
 *                 type: string
 *                 enum: [cash, momo, vnpay, bank]
 *                 example: "cash"
 *               amount:
 *                 type: number
 *                 example: 150000
 *               transactionRef:
 *                 type: string
 *               markAsPaid:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Payment created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /v1/payments/{id}:
 *   get:
 *     summary: Get payment by ID (Staff/Admin)
 *     tags: [Payments]
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
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 *
 *   delete:
 *     summary: Delete payment (Staff/Admin)
 *     tags: [Payments]
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
 *         description: Payment deleted
 *
 * /v1/payments/{id}/status:
 *   patch:
 *     summary: Update payment status (Staff/Admin)
 *     tags: [Payments]
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
 *                 enum: [pending, paid, failed, refunded]
 *               transactionRef:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */

/**
 * @swagger
 * /v1/payments/by-order/{orderId}:
 *   get:
 *     summary: Get payments by order ID
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payments for the order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     orderSummary:
 *                       type: object
 *                       properties:
 *                         totalPrice:
 *                           type: number
 *                         totalPaid:
 *                           type: number
 *                         remaining:
 *                           type: number
 *                         isFullyPaid:
 *                           type: boolean
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */

// ==================== WEBHOOKS (Public) ====================

/**
 * @swagger
 * /v1/payments/webhook/momo:
 *   post:
 *     summary: MoMo payment webhook
 *     tags: [Payments]
 *     description: Public endpoint for MoMo IPN
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partnerCode:
 *                 type: string
 *               orderId:
 *                 type: string
 *               requestId:
 *                 type: string
 *               amount:
 *                 type: number
 *               resultCode:
 *                 type: integer
 *                 description: Zero means success
 *               message:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed
 */

/**
 * @swagger
 * /v1/payments/webhook/vnpay:
 *   post:
 *     summary: VNPay payment webhook
 *     tags: [Payments]
 *     description: Public endpoint for VNPay IPN
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               vnp_TxnRef:
 *                 type: string
 *               vnp_Amount:
 *                 type: number
 *               vnp_ResponseCode:
 *                 type: string
 *                 description: Double zero means success
 *               vnp_SecureHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 RspCode:
 *                   type: string
 *                 Message:
 *                   type: string
 */