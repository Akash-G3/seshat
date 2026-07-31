// import { NextFunction, Request, Response } from 'express';
// import { THttpError } from '../types/types';

// export default (err: THttpError, _: Request, res: Response, __: NextFunction) => {
//   res.status(err.statusCode).json(err);
// };
///Improvised global error handler
import { NextFunction, Request, Response } from 'express';
import errorObject from '../errors/errorObject';

export default (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // Whatever comes in — AppError, raw Error, Prisma error, literally anything —
  // gets normalized HERE. No upstream code needs to pre-convert it anymore.
  const normalized = errorObject(err, req);
  res.status(normalized.statusCode).json(normalized);
};
