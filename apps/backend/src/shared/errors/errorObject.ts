// Improvise4d errorObject file

import { Request } from 'express';
import { EApplicationEnvironment } from '../../constants/application';
import responseMessage from '../../constants/responseMessage';
import { THttpError } from '../types/types';
import { env } from '../../config/env';
import { AppError } from './appError';
import logger from '../utils/logger';

export default (err: unknown, req: Request): THttpError => {
  // Default assumption: unknown error = unexpected = 500, not safe to expose details
  let statusCode = 500;
  let message = responseMessage.SOMETHING_WENT_WRONG;
  let isOperational = false;
  let data: unknown = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    data = err.data;
  } else if (err instanceof Error) {
    // Some other kind of Error slipped through un-typed — keep its message
    // but treat as non-operational since we didn't explicitly throw it
    message = err.message || message;
  }

  const errorObj: THttpError = {
    success: false,
    statusCode,
    request: {
      ip: req.ip || null,
      method: req.method,
      url: req.originalUrl,
    },
    message,
    data,
    // Only attach a stack trace for genuinely unexpected errors —
    // an operational error (401, 404, validation, etc.) doesn't need one.
    trace: !isOperational && err instanceof Error ? { error: err.stack } : null,
  };

  // Non-operational = genuinely unexpected — this is what should page someone / get watched closely
  if (!isOperational) {
    logger.error(`UNEXPECTED_ERROR`, { meta: errorObj });
  } else {
    // Keep operational logs terse — just enough context, no stack, no full object dump
    logger.info(`OPERATIONAL_ERROR`, {
      statusCode,
      message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  if (env.NODE_ENV === EApplicationEnvironment.PRODUCTION) {
    delete errorObj.request.ip;
    delete errorObj.trace;
  }

  return errorObj;
};
