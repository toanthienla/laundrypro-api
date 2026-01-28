/**
 * @swagger
 * tags:
 *   - name: Services
 *     description: Laundry service management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Giặt thường"
 *         category:
 *           type: string
 *           example: "Giặt sấy"
 *         price:
 *           type: number
 *           example: 15000
 *         unit:
 *           type: string
 *           example: "kg"
 *         image:
 *           type: string
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/services:
 *   get:
 *     summary: Get all services (Public)
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of services
 *
 *   post:
 *     summary: Create service (Admin)
 *     tags: [Services]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               active:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Service created
 *       403:
 *         description: Admin required
 */

/**
 * @swagger
 * /v1/services/categories:
 *   get:
 *     summary: Get all categories (Public)
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @swagger
 * /v1/services/{id}:
 *   get:
 *     summary: Get service by ID (Public)
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Not found
 *
 *   put:
 *     summary: Update service (Admin)
 *     tags: [Services]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *               active:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Service updated
 *       404:
 *         description: Not found
 *
 *   delete:
 *     summary: Delete service (Admin)
 *     tags: [Services]
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
 *         description: Service deleted
 *       404:
 *         description: Not found
 */