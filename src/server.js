/* eslint-disable no-console */
import express from 'express';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import exitHook from 'async-exit-hook';
import env from '~/config/environment.js';
import Router from '~/routes/index.js';
import errorHandlingMiddleware from '~/middlewares/errorHandlingMiddleware';
import cors from 'cors';
import { corsOptions } from '~/config/cors';
import cookieParser from 'cookie-parser';

const app = express();

const hostname = env.APP_HOST;
const port = env.APP_PORT;

const START_SERVER = () => {
  // Cookie Parser
  app.use(cookieParser());

  // CORS
  app.use(cors(corsOptions));

  // JSON body
  app.use(express.json());

  // Routes
  app.use('/', Router);

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
