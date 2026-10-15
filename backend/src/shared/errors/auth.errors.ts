import { ApiError } from './api-error.js';

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super({
      statusCode: 401,
      message: 'Invalid email or password.',
    });

    this.name = 'InvalidCredentialsError';
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super({
      statusCode: 403,
      message: 'You do not have permission to perform this action.',
    });

    this.name = 'ForbiddenError';
  }
}
