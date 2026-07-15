export interface ApiErrorOptions {
  statusCode: number;
  message: string;
  errors?: unknown[];
  isOperational?: boolean;
}

export class ApiError extends Error {
  public readonly statusCode: number;

  public readonly errors: unknown[];

  public readonly isOperational: boolean;

  public constructor({ statusCode, message, errors = [], isOperational = true }: ApiErrorOptions) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}
