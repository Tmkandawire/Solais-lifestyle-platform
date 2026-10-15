import { ApiError } from './api-error.js';

export class VendorApplicationNotFoundError extends ApiError {
  constructor(id: string) {
    super({
      statusCode: 404,
      message: `No vendor application found with id "${id}".`,
    });
  }
}

export class VendorApplicationForbiddenError extends ApiError {
  constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage vendor applications.',
    });
  }
}

export class VendorApplicationInvalidStateError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}
