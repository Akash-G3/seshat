export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean; // true = expected/safe-to-show-user, false = bug/unexpected
  public readonly data: unknown;

  constructor(message: string, statusCode: number, isOperational = true, data: unknown = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.data = data;

    // Keeps `instanceof AppError` working correctly when compiled
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}