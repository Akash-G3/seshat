import { Pool, type QueryResultRow } from 'pg';
import { env } from '../config/env';
import logger from '../utils/logger';

// A Pool, not a single Client — pg.Pool manages a small set of reusable
// physical connections internally. Every pool.query() call borrows an
// idle connection, runs the query, and returns it — you never manage
// connections manually for simple queries

const pool = new Pool ({
    connectionString: env.DATABASE_URL, 
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,

});

// Surface pool-level errors (e.g. a backend connection was terminated
// unexpectedly) instead of letting them crash the process silently.
pool.on('error', (err) => {
    logger.error('Unexprected error on idle Postgres client', err);
});


/**
 * The single entry point every service uses to talk to the database.
 * Generic <T> lets callers type the shape of rows they expect back.
 *
 * Why wrap pool.query() instead of exporting `pool` directly?
 * — This is the one seam you'll edit if you ever swap to an ORM:
 *   the function signature (text in, rows out) can stay the same
 *   while the implementation underneath changes completely.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
): Promise<T[]> {
    const result =await pool.query<T>(text, params);
    return result.rows;
}


/**
 * For multi-step operations that must succeed or fail together
 * (e.g. transferring a value between two rows). Manually checks out
 * a client, so the release() in `finally` is mandatory — skipping it
 * leaks a connection out of the pool permanently.
 */
export async function withTransaction<T>(
  fn: (query: typeof pool.query) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client.query.bind(client));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // returns the connection to the pool — always runs
  }
}

/** Called once on boot — confirms the database is reachable before serving traffic. */
export async function checkConnection(): Promise<void> {
  await pool.query('SELECT 1');
}

/** Called once on shutdown — closes all pooled connections cleanly. */
export async function closePool(): Promise<void> {
  await pool.end();
}