import swaggerJsdoc from 'swagger-jsdoc';
import env from '~/config/environment';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LaundryPro API',
      version: '1.0.0',
      description: 'API Documentation for LaundryPro',
      contact: {
        name: 'Support',
        email: 'support@laundrypro.com'
      }
    },
    servers: [
      {
        url: env.BUILD_MODE === 'production'
          ? `https://${env.APP_HOST}`
          : `http://${env.APP_HOST}:${env.APP_PORT}`,
        description: env.BUILD_MODE === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Update this line to look into src/swagger folder
  apis: ['./src/swagger/**/*.js', './src/swagger/**/*.ts']
};

export const specs = swaggerJsdoc(options);