import { Request } from 'express';
import { EApplicationEnvironment } from '../../constants/application';
import responseMessage from '../../constants/responseMessage';
import { THttpError } from '../types/types';
import { env } from '../../config/env';
import { AppError } from './appError';
import logger from '../utils/logger';

/** Never write credentials/tokens/cookies to application logs. */
const SENSITIVE_KEYS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'resendApiKey',
  'jwtAccessSecret',
  'jwtRefreshSecret',
]);

const redact = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(redact);

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : redact(item);
    }
    return output;
  }

  return value;
};

const getRequestMeta = (req: Request) => ({
  ip: req.ip || null,
  method: req.method,
  url: req.originalUrl,
  protocol: req.protocol,
  hostname: req.hostname,
  userAgent: req.get('user-agent') || null,
  contentType: req.get('content-type') || null,
  query: redact(req.query),
  params: redact(req.params),
  body: redact(req.body),
  referer: req.get('referer') || null,
});

export default (err: unknown, req: Request): THttpError => {
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
    // Preserve the real error internally, but never expose it to production clients.
    message = err.message || message;
  }

  const requestMeta = getRequestMeta(req);
  const errorDetails = {
    error: {
      name: err instanceof Error ? err.name : typeof err,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? (err.stack ?? null) : null,
      ...(err instanceof AppError
        ? {
            statusCode: err.statusCode,
            isOperational: err.isOperational,
            data: redact(err.data),
          }
        : {}),
    },
    request: requestMeta,
  };

  const errorObj: THttpError = {
    success: false,
    statusCode,
    request: {
      ip: requestMeta.ip,
      method: requestMeta.method,
      url: requestMeta.url,
    },
    message,
    data,
    // Detailed stack is deliberately returned only in development.
    trace:
      env.NODE_ENV === EApplicationEnvironment.DEVELOPMENT && err instanceof Error
        ? { error: err.stack ?? null }
        : null,
  };

  if (!isOperational || statusCode >= 500) {
    logger.error('UNEXPECTED_ERROR', errorDetails);
  } else {
    // 4xx errors are expected application errors, but still contain complete
    // diagnostic request metadata in the logs.
    logger.warn('OPERATIONAL_ERROR', errorDetails);
  }

  if (env.NODE_ENV === EApplicationEnvironment.PRODUCTION) {
    delete errorObj.request.ip;
    errorObj.trace = null;
  }

  return errorObj;
};
