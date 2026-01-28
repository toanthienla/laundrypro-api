/* eslint-disable no-console */
import express from 'express';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import exitHook from 'async-exit-hook';
import env from '~/config/environment';
import { APIs_V1 } from '~/routes/v1/index';
import errorHandlingMiddleware from '~/middlewares/errorHandlingMiddleware';
import cors from 'cors';
import { corsOptions } from '~/config/cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { specs } from '~/config/swagger';

const app = express();

const hostname = env.APP_HOST;
const port = process.env.PORT || env.APP_PORT;

const START_SERVER = () => {
  // Cookie Parser
  app.use(cookieParser());

  // CORS
  app.use(cors(corsOptions));

  // JSON body
  app.use(express.json());

  // Swagger UI Route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
  console.log('Swagger UI available at /api-docs');

  // Routes
  app.use('/v1', APIs_V1);

  // Error handling
  app.use(errorHandlingMiddleware);

  // Start server
  if (env.BUILD_MODE === 'production') {
    app.listen(port, () => {
      console.log(`PRODUCTION: LaundryPro API running on port ${port}`);
    });
  } else {
    app.listen(port, hostname, () => {
      console.log(
        `DEV: LaundryPro API running at http://${hostname}:${port}`
      );
    });
  }

  // Graceful shutdown
  exitHook(async () => {
    console.log('Cleaning MongoDB connection...');
    await CLOSE_DB();
  });
};

// IIFE
(async () => {
  try {
    await CONNECT_DB();
    START_SERVER();
  } catch (error) {
    console.error('Server start failed:', error);
    process.exit(1);
  }
})();
