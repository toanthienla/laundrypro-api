/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment processing and management, Clean 1-1 with Order, orderId unique
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65b1234567890abcdef12348"
 *         orderId:
 *           type: string
 *           description: Reference to order. Constraint. Unique index enforces 1-1 relationship, One Order equals One Payment.
 *           example: "65b1234567890abcdef12346"
 *         method:
 *           type: string
 *           enum: [cash, momo, vnpay, bank]
 *           example: "cash"
 *         amount:
 *           type: number
 *           description: Payment amount in VND, must equal order total exactly
 *           example: 150000
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [pending, paid, failed, refunded]
 *           example: "paid"
 *         transactionRef:
 *           type: string
 *           description: Transaction reference from payment gateway
 *           example: "MOMO250129123456"
 *           nullable: true
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: When payment was confirmed
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Removed PaymentWithOrder inline object to keep only 3 schemas total as requested

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
 *         description: Filter by specific order, returns 0 or 1 result due to 1-1 unique constraint
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *     description: |
 *       Create a single payment for an order, Clean 1-1 relationship.
 *       Constraints. Order must not have existing payment, enforced by unique index on orderId. Payment amount must equal order total exactly. Returns 409 Conflict if order already has a payment.
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
 *                 description: Order to pay for, must not have existing payment due to 1-1 constraint
 *                 example: "65b1234567890abcdef12346"
 *               method:
 *                 type: string
 *                 enum: [cash, momo, vnpay, bank]
 *                 example: "cash"
 *               amount:
 *                 type: number
 *                 description: Must equal order totalPrice exactly, 1-1 payment
 *                 example: 150000
 *               transactionRef:
 *                 type: string
 *                 maxLength: 100
 *               markAsPaid:
 *                 type: boolean
 *                 default: false
 *                 description: For cash payments, mark as paid immediately
 *     responses:
 *       201:
 *         description: Payment created, 1-1 link established via orderId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Payment created successfully."
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Amount does not match order total
 *       403:
 *         description: Staff cannot create payment for completed order
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order already has a payment, 1-1 constraint violation
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
 *     description: |
 *       Delete payment. In Clean 1-1 design, Order does not store paymentId reference, so no need to update Order document. Order will simply return payment as null on next fetch.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Payment deleted successfully."
 *       403:
 *         description: Only admin can delete paid payments
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /v1/payments/{id}/status:
 *   patch:
 *     summary: Update payment status (Staff/Admin)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Update payment status with automatic order completion.
 *       Setting status to paid automatically completes the associated order.
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
 *                 maxLength: 100
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Only admin can process refunds
 *       404:
 *         description: Payment not found
 */

/**
 * @swagger
 * /v1/payments/{id}/method:
 *   patch:
 *     summary: Update payment method (Staff/Admin)
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Update payment method for a pending payment.
 *       Only allowed when payment status is pending. Cannot change method for paid, failed, or refunded payments.
 *       Common use case: Switching from bank transfer to cash, or MoMo to VNPay before payment is processed.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - method
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [cash, momo, vnpay, bank]
 *                 description: |
 *                   New payment method. Must be one of the supported methods.
 *                   Cannot be changed if payment is already processed.
 *                 example: "momo"
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Payment method updated successfully."
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: |
 *           Bad Request - Possible reasons:
 *           - Invalid payment method
 *           - Payment is not pending (cannot modify paid/failed/refunded payments)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: "Cannot update method for paid payment. Only pending payments can be modified."
 *       403:
 *         description: Forbidden - Only Staff or Admin can update payment method
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 403
 *                 message:
 *                   type: string
 *                   example: "Staff or Admin access required."
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: "Payment not found."
 *       422:
 *         description: Validation failed - Invalid method format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 422
 *                 message:
 *                   type: string
 *                   example: "Method must be one of: cash, momo, vnpay, bank"
 */

/**
 * @swagger
 * /v1/payments/by-order/{orderId}:
 *   get:
 *     summary: Get payment by order ID, Clean 1-1
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Returns order summary with associated payment, queried by unique orderId.
 *       Due to 1-1 constraint, returns single payment object or null.
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found or null
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
 *                     order:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         totalPrice:
 *                           type: number
 *                         status:
 *                           type: string
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *                       nullable: true
 *                       description: Single payment or null, Clean 1-1
 *       404:
 *         description: Order not found
 */

// ==================== WEBHOOKS (Public) ====================

/**
 * @swagger
 * /v1/payments/webhook/momo:
 *   post:
 *     summary: MoMo payment webhook
 *     tags: [Payments]
 *     description: |
 *       Public endpoint for MoMo IPN.
 *       Returns 200 immediately, processes asynchronously to avoid gateway timeout.
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
 *               resultCode:
 *                 type: integer
 *               message:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook received, processed asynchronously
 */

/**
 * @swagger
 * /v1/payments/webhook/vnpay:
 *   post:
 *     summary: VNPay payment webhook
 *     tags: [Payments]
 *     description: |
 *       Public endpoint for VNPay IPN.
 *       Returns 200 immediately, processes asynchronously.
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
 *               vnp_SecureHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Webhook received, processed asynchronously
 */