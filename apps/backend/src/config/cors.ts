import type { CorsOptions } from "cors";
import { env } from './env';
import { AppError } from "../shared/errors/appError";

const allowedOrigins = new Set(env.CLIENT_URL);

export const corsOptions: CorsOptions = {
    origin: (origin , callback) => {
        //no origin header = same origin, curl, server-to-server, or bruno/postman
        if (!origin) return callback(null, true);

        if (allowedOrigins.has(origin)) {
            return callback(null , true);
        }
        return callback(new AppError ('Not allowed by CORS', 403));
    },
    credentials:true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Set-Cookie'],
    maxAge: 86400, //cache preflight for 24hrs, cuts down OPTIONS trafffic
    optionsSuccessStatus: 204
};