export interface ApiErrorOptions {
  statusCode: number;
  message: string;
  errors?: unknown[];
  isOperational?: boolean;
  code?: string;
  data?: Record<string, unknown>;
}

export class ApiError extends Error {
  public readonly statusCode: number;

  public readonly errors: unknown[];

  public readonly isOperational: boolean;

  public readonly code: string | undefined;

  public readonly data: Record<string, unknown> | undefined;

  public constructor({
    statusCode,
    message,
    errors = [],
    isOperational = true,
    code,
    data,
  }: ApiErrorOptions) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.code = code;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}
