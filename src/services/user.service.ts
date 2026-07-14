import { query, withTransaction } from '../db/postgres';

interface User {
  id: string;
  name: string;
  email: string;
}

// Simple read — service code never sees `pg`, just calls query().
export async function getUserById(id: string): Promise<User | null> {
  const rows = await query<User>(
    'SELECT id, name, email FROM users WHERE id = $1',
    [id]
  );
  return rows[0] ?? null;
}

// Multi-step write wrapped in a transaction.
export async function createUserWithProfile(
  name: string,
  email: string
): Promise<User> {
  return withTransaction(async (txQuery) => {
    const userResult = await txQuery(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    const user = userResult.rows[0] as User;

    await txQuery('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);

    return user;
  });
}