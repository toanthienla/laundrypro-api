/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management, Clean 1-1 with Payment
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65b1234567890abcdef12345"
 *         orderId:
 *           type: string
 *           example: "65b1234567890abcdef12346"
 *         serviceId:
 *           type: string
 *           example: "65b1234567890abcdef12347"
 *         serviceName:
 *           type: string
 *           example: "Giặt thường"
 *         serviceCategory:
 *           type: string
 *           example: "Giặt sấy"
 *         servicePrice:
 *           type: number
 *           description: Original service price, snapshot at order time
 *           example: 15000
 *         serviceUnit:
 *           type: string
 *           example: "kg"
 *         quantity:
 *           type: number
 *           minimum: 1
 *           example: 5
 *         unitPrice:
 *           type: number
 *           description: Actual price charged
 *           example: 15000
 *           minimum: 0
 *         totalPrice:
 *           type: number
 *           description: quantity times unitPrice
 *           example: 75000
 *         note:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65b1234567890abcdef12346"
 *         customerId:
 *           type: object
 *           description: Populated customer info
 *           properties:
 *             _id:
 *               type: string
 *             phone:
 *               type: string
 *               example: "+84901234567"
 *             name:
 *               type: string
 *               example: "Nguyen Van A"
 *             address:
 *               type: string
 *             email:
 *               type: string
 *         createdBy:
 *           type: object
 *           description: Staff who created the order
 *           properties:
 *             _id:
 *               type: string
 *             phone:
 *               type: string
 *               example: "+84909998888"
 *             name:
 *               type: string
 *               example: "Staff Nguyen"
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           example: "pending"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-01-31T14:00:00.000Z"
 *         totalPrice:
 *           type: number
 *           example: 150000
 *           minimum: 0
 *         payment:
 *           $ref: '#/components/schemas/Payment'
 *           description: Payment object queried separately from Payment collection, Clean 1-1. Null if no payment exists for this order.
 *           nullable: true
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         note:
 *           type: string
 *           nullable: true
 *           example: "Giao hàng nhanh giúp mình"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ==================== MY ORDERS (Customer) ====================

/**
 * @swagger
 * /v1/orders/my-orders:
 *   get:
 *     summary: Get my orders (Customer)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: Returns orders for the authenticated customer with items and payment info. Payment is queried separately from Payment collection, Clean 1-1 design.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
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
 *         description: List of orders with payment info, queried separately
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
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
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /v1/orders/my-orders/{id}:
 *   get:
 *     summary: Get my order by ID (Customer)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: Returns single order with items and payment. Payment is queried separately from Payment collection.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details with payment, queried separately
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Not found
 */

// ==================== ORDERS (Staff/Admin) ====================

/**
 * @swagger
 * /v1/orders:
 *   get:
 *     summary: Get all orders (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: Returns all orders with customer info, items, and payment, queried separately.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: customerPhone
 *         schema:
 *           type: string
 *         example: "+84901234567"
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
 *         description: List of orders with payments
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *       403:
 *         description: Staff/Admin required
 *
 *   post:
 *     summary: Create order (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Create order for customer. Creates customer if not exists.
 *       Note: Payment is created separately via /v1/payments (Clean 1-1).
 *       New orders return payment as null.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerPhone
 *               - customerName
 *               - items
 *             properties:
 *               customerPhone:
 *                 type: string
 *                 example: "+84901234567"
 *               customerName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               customerAddress:
 *                 type: string
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceId
 *                     - quantity
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                     unitPrice:
 *                       type: number
 *                     note:
 *                       type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created, payment is null
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
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Service not active
 *       403:
 *         description: Staff/Admin required
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /v1/orders/search:
 *   get:
 *     summary: Search orders by customer phone (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         example: "+84901234567"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed]
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
 *         description: Customer and orders with payments
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
 *                     customer:
 *                       type: object
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *       403:
 *         description: Staff/Admin required
 */

/**
 * @swagger
 * /v1/orders/stats:
 *   get:
 *     summary: Get order statistics (Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Order statistics
 *       403:
 *         description: Admin required
 */

/**
 * @swagger
 * /v1/orders/{id}:
 *   get:
 *     summary: Get order by ID (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: Returns order with items and payment, queried separately from Payment collection.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details with payment info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Update order (Staff/Admin)
 *     tags: [Orders]
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
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
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
 *                   $ref: '#/components/schemas/Order'
 *       403:
 *         description: Staff can only update pending orders
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete order (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: Cascade deletes order items and associated payment, Clean 1-1, payment queried by orderId.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted and payment if existed
 *       403:
 *         description: Staff cannot delete order with paid payment
 *       404:
 *         description: Not found
 */

/**
 * @swagger
 * /v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Completion Rule. Order can only be completed if payment exists in Payment collection and status is paid.
 *       Payment is queried by orderId, Clean 1-1.
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
 *                 enum: [pending, completed]
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
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cannot complete, payment not found or not paid
 *       403:
 *         description: Staff can only update pending orders
 */

// ==================== ORDER ITEMS ====================

/**
 * @swagger
 * /v1/orders/{orderId}/items:
 *   post:
 *     summary: Add item to order (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               - serviceId
 *               - quantity
 *             properties:
 *               serviceId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *               unitPrice:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added, returns updated order with payment
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
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Service not active
 *       403:
 *         description: Staff can only modify pending orders
 *       404:
 *         description: Order or service not found
 */

/**
 * @swagger
 * /v1/orders/{orderId}/items/{itemId}:
 *   put:
 *     summary: Update order item (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *               unitPrice:
 *                 type: number
 *                 minimum: 0
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated, returns updated order with payment
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
 *                   $ref: '#/components/schemas/Order'
 *       403:
 *         description: Staff can only modify pending orders
 *       404:
 *         description: Order or item not found
 *
 *   delete:
 *     summary: Delete order item (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted, returns updated order with payment
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
 *                   $ref: '#/components/schemas/Order'
 *       403:
 *         description: Staff can only modify pending orders
 *       404:
 *         description: Order or item not found
 */