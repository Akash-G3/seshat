export default class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    this.name = "AppError";

    Object.setPrototypeOf(this, AppError.prototype);
  }
}