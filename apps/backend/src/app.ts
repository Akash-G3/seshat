import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import authRoutes from './modules/auth/auth.routes';
import noteRoutes from "./modules/note/note.routes";
import workspaceRoutes from "./modules/workspace/workspace.routes";
import notebookRoutes from "./modules/notebook/notebook.routes";
import globalErrorHandler from './shared/middlewares/globalErrorHandler';
import { NotFoundError } from './shared/errors/errors';
import cookieParser from 'cookie-parser';

const app = express();

//middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

//cookie-parser
app.use(cookieParser());

//routes
app.use('/api/auth', authRoutes);
app.use("/api/workspace", workspaceRoutes);
app.use("/api/notebooks", notebookRoutes);
app.use("/api/notes", noteRoutes);


//404Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

//Global error handler
app.use(globalErrorHandler);

export default app;
