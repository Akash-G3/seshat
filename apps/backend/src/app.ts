import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
// Import routes here
import globalErrorHandler from './shared/middlewares/globalErrorHandler';
import responseMessage from './constants/responseMessage';
import httpError from './shared/utils/httpError';

const app = express();

//middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

//routes
// app.use();

//404Handler
app.use((req: Request, _: Response, next: NextFunction) => {
  try {
    throw new Error(responseMessage.NOT_FOUND('route'));
  } catch (err) {
    httpError(next, err, req, 404);
  }
});

//Global error handler
app.use(globalErrorHandler);

export default app;
