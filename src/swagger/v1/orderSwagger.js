/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management
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
 *         orderId:
 *           type: string
 *         serviceId:
 *           type: string
 *         serviceName:
 *           type: string
 *           example: "Giặt thường"
 *         serviceCategory:
 *           type: string
 *           example: "Giặt sấy"
 *         servicePrice:
 *           type: number
 *           description: Original service price (snapshot)
 *           example: 15000
 *         serviceUnit:
 *           type: string
 *           example: "kg"
 *         quantity:
 *           type: number
 *           example: 5
 *         unitPrice:
 *           type: number
 *           description: Actual price charged
 *           example: 15000
 *         totalPrice:
 *           type: number
 *           description: quantity × unitPrice
 *           example: 75000
 *         note:
 *           type: string
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
 *         customerId:
 *           type: string
 *         createdBy:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *         completedAt:
 *           type: string
 *           format: date-time
 *         totalPrice:
 *           type: number
 *           example: 150000
 *         note:
 *           type: string
 *         orderItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of my orders
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
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
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-01-31"
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
 *         description: List of orders
 *       403:
 *         description: Staff/Admin required
 *
 *   post:
 *     summary: Create order (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       Create order for customer. If customer doesn't exist, a new customer will be created.
 *
 *       - `unitPrice` is optional. If not provided, uses `service.price`
 *       - `servicePrice` is automatically saved as snapshot of original price
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
 *                 example: "123 Nguyen Hue, Q1, HCM"
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
 *                       example: 5
 *                     unitPrice:
 *                       type: number
 *                       description: Optional. Uses service.price if not provided
 *                       example: 15000
 *                     note:
 *                       type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
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
 *         description: Customer and orders
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
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-01-31"
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Update order (Staff/Admin)
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     description: |
 *       **Access Control:**
 *       - Staff: Can only update `pending` orders
 *       - Admin: Can update any order
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
 *     description: |
 *       **Access Control:**
 *       - Staff: Can only delete `pending` orders
 *       - Admin: Can delete any order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted
 *       403:
 *         description: Staff can only delete pending orders
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
 *       **Access Control:**
 *       - Staff: Can only update `pending` → `completed`
 *       - Admin: Can update any status
 *
 *       **Auto fields:**
 *       - `completed` → sets `completedAt` to current time
 *       - `pending` → clears `completedAt`
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
 *       403:
 *         description: Staff can only update pending orders
 *       404:
 *         description: Not found
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
 *     description: |
 *       **Access Control:**
 *       - Staff: Can only add items to `pending` orders
 *       - Admin: Can add items to any order
 *       
 *       **Pricing:**
 *       - `unitPrice` is optional. If not provided, uses `service.price`
 *       - Order total is automatically recalculated
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
 *                 example: 3
 *               unitPrice:
 *                 type: number
 *                 description: Optional. Uses service.price if not provided
 *                 example: 15000
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added, returns updated order
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
 *     description: |
 *       **Access Control:**
 *       - Staff: Can only update items in `pending` orders
 *       - Admin: Can update items in any order
 *       
 *       Order total is automatically recalculated.
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
 *         description: Item updated, returns updated order
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
 *     description: |
 *       **Access Control:**
 *       - Staff: Can only delete items from `pending` orders
 *       - Admin: Can delete items from any order
 *       
 *       Order total is automatically recalculated.
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
 *         description: Item deleted, returns updated order
 *       403:
 *         description: Staff can only modify pending orders
 *       404:
 *         description: Order or item not found
 */