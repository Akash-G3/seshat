import { NextFunction, Request, Response } from 'express';
import errorObject from '../errors/errorObject';

export default (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const normalized = errorObject(err, req);
  res.status(normalized.statusCode).json(normalized);
};
