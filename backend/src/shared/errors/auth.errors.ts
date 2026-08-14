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
