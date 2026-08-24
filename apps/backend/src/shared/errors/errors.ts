import { AppError } from './appError';

// Each one hardcodes its own status code so call sites never need to remember it
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', data: unknown = null) {
    super(message, 400, true, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict', data: unknown = null) {
    super(message, 409, true, data);
  }
}
