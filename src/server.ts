// import app from './app';
// import { env } from './config/env.js';
// import logger from './utils/logger';

// const server = app.listen(env.PORT);

// //IIFE
// (() => {
//   try {
//     //Database connection

//     logger.info(`App_got_Started`, {
//       meta: {
//         PORT: env.PORT,
//         SERVER_URL: env.SERVER_URL,
//       },
//     });
//   } catch (err) {
//     logger.error(`App_get_error`, { meta: err });
//     server.close((error) => {
//       if (error) {
//         logger.error(`App_get_error`, { meta: error });
//       }
//       process.exit(1);
//     });
//   }
// })();


import app from './app';
import { env } from './config/env.js';
import logger from './utils/logger';
import { checkConnection, closePool } from './db/postgres';

const server = app.listen(env.PORT);

//IIFE
(async () => {
  try {
    //Database connection
    await checkConnection();

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

process.on('SIGTERM', async () => {
  await closePool();
  server.close(() => {
    logger.info('App_shutdown_gracefully');
    process.exit(0);
  });
});