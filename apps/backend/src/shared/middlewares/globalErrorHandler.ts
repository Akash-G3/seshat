import { NextFunction, Request, Response } from 'express';
import errorObject from '../errors/errorObject';

/**
 * Last middleware in the pipeline. Every thrown/rejected error is normalized
 * and logged here so controllers/services don't need their own error format.
 */
export default (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const normalized = errorObject(err, req);
  res.status(normalized.statusCode).json(normalized);
};
