/**
 * @swagger
 * tags:
 *   name: Services
 *   description:  Laundry service catalog management
 */

/**
 * @swagger
 * components:
 *   schemas: 
 *     Service:
 *       type: object
 *       properties:
 *         _id:
 *           type:  string
 *         name:
 *           type:  string
 *         category: 
 *           type: string
 *         unit:
 *           type: string
 *         image:
 *           type: string
 *           description:  Cloudinary image URL
 *         active:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /v1/services: 
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - in:  query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in:  query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or category
 *     responses:
 *       200:
 *         description: List of services
 *         content: 
 *           application/json: 
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type:  array
 *                   items: 
 *                     $ref:  '#/components/schemas/Service'
 */

/**
 * @swagger
 * /v1/services/categories:
 *   get: 
 *     summary: Get all service categories
 *     tags: [Services]
 *     responses: 
 *       200:
 *         description: List of unique categories
 *         content: 
 *           application/json: 
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Wash & Iron", "Dry Clean", "Steam Press"]
 */

/**
 * @swagger
 * /v1/services/{id}: 
 *   get:
 *     summary: Get service by ID
 *     tags:  [Services]
 *     parameters:
 *       - in:  path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: 
 *                   type: boolean
 *                 data: 
 *                   $ref: '#/components/schemas/Service'
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /v1/services: 
 *   post:
 *     summary: Create a new service (Admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content: 
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - unit
 *             properties:
 *               name: 
 *                 type: string
 *                 description: Service name
 *                 example: "Shirt"
 *               category:
 *                 type: string
 *                 description: Service category
 *                 example: "Wash & Iron"
 *               unit: 
 *                 type: string
 *                 description: Unit of measurement
 *                 example: "piece"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Service image file (jpg, png, gif, webp - max 5MB)
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description:  Unauthorized
 *       403:
 *         description: Admin access required
 *       422:
 *         description:  Validation error
 */

/**
 * @swagger
 * /v1/services/{id}: 
 *   put:
 *     summary: Update a service (Admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
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
 *               unit: 
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New service image file
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /v1/services/{id}:
 *   delete:
 *     summary: Delete a service (Admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */