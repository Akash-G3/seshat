import dotenv from 'dotenv';
import { z } from 'zod';
import { EApplicationEnvironment } from '../constants/application';

dotenv.config();
//load .env file into process.env

//Define the shape and rules for every env var your app needs
const envSchema = z.object({
  NODE_ENV: z.enum(EApplicationEnvironment).default(EApplicationEnvironment.DEVELOPMENT),
  PORT: z.coerce.number().default(3000),
  SERVER_URL: z.url(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
});

//validate process.env against that shape
const parsed = envSchema.safeParse(process.env);

//Fail fast and loud if anything is missing or wrong
if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

//export the validated fully typed env object for using everywhere else
export const env = parsed.data;
