/**
 * @swagger
 * tags:
 *   - name: Contacts
 *     description: Contact messages management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           example: "Nguyen Van A"
 *         email:
 *           type: string
 *           example: "example@gmail.com"
 *         subject:
 *           type: string
 *           example: "General Inquiry"
 *         message:
 *           type: string
 *           example: "I need help with my order."
 *         status:
 *           type: string
 *           enum: [new, read, replied]
 *           example: "new"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     ContactPaginationResponse:
 *       type: object
 *       properties:
 *         contacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Contact'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 25
 */

/**
 * @swagger
 * /v1/contacts:
 *   post:
 *     summary: Send contact message (Public)
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               email:
 *                 type: string
 *                 example: "example@gmail.com"
 *               subject:
 *                 type: string
 *                 example: "General Inquiry"
 *               message:
 *                 type: string
 *                 example: "I need help with my order."
 *     responses:
 *       201:
 *         description: Message saved successfully
 *       400:
 *         description: Validation error
 *
 *   get:
 *     summary: Get all contact messages (Admin/Staff)
 *     tags: [Contacts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: List of contact messages with pagination
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactPaginationResponse'
 *       403:
 *         description: Unauthorized (Admin/Staff required)
 */