// import app from './app';
// import { env } from './config/env.js';
// import logger from './shared/utils/logger';
// import { checkConnection, closePool } from './db/postgres';

// const server = app.listen(env.PORT);

// //IIFE
// (async () => {
//   try {
//     //Database connection
//     await checkConnection();

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

// process.on('SIGTERM', async () => {
//   await closePool();
//   server.close(() => {
//     logger.info('App_shutdown_gracefully');
//     process.exit(0);
//   });
// });

// ------------------- Improves server.ts due to shutdown and database initials


import app from './app';
import { env } from './config/env.js';
import logger from './shared/utils/logger';
import { checkConnection, closePool } from './db/postgres';

let server: ReturnType<typeof app.listen>;

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down...`);

  try {
    await closePool();

    server.close(() => {
      logger.info('App_shutdown_gracefully');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Error during graceful shutdown', { meta: err });
    process.exit(1);
  }
};

// IIFE
(async () => {
  try {
    // Ensure the database is reachable before starting the server
    await checkConnection();

    server = app.listen(env.PORT, () => {
      logger.info('App_got_Started', {
        meta: {
          PORT: env.PORT,
          SERVER_URL: env.SERVER_URL,
        },
      });
    });
  } catch (err) {
    logger.error('App_get_error', { meta: err });
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});