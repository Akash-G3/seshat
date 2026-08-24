import express, { NextFunction, Request, Response } from 'express';
// this import for security modules like helmet
import cors from 'cors';
import { corsOptions } from './config/cors';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import noteRoutes from './modules/note/note.routes';
import workspaceRoutes from './modules/workspace/workspace.routes';
import notebookRoutes from './modules/notebook/notebook.routes';
import globalErrorHandler from './shared/middlewares/globalErrorHandler';
import { NotFoundError } from './shared/errors/errors';

const app = express();

//1. Security Headers - should run before anything else touches the request

//2. CORS - must run before body parsing / cookies / routes
app.use(cors(corsOptions));

//3. Body parsers
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

//4. cookie-parser - needed before auth to read jwt cookies
app.use(cookieParser());

// 5. Request logging (morgan/pino-http, if you have it)
// app.use(requestLogger);

//6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/notebooks', notebookRoutes);
app.use('/api/notes', noteRoutes);

//7. 404Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

//8. Global error handler or Centralised error handler at last
app.use(globalErrorHandler);

export default app;
