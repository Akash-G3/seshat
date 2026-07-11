import app from './app';
import { env } from './config/env.js';
import logger from './utils/logger';

const server = app.listen(env.PORT);

//IIFE
(() => {
  try {
    //Database connection

    logger.info(`App_got_Started`, {
      meta: {
        PORT: env.PORT,
        SERVER_URL: env.SERVER_URL,
      },
    });
  } catch (err) {
    logger.error(`App_get_error`, { meta: err });
    server.close((error) => {
      if (error) {
        logger.error(`App_get_error`, { meta: error });
      }
      process.exit(1);
    });
  }
})();
