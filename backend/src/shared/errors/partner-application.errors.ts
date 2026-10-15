import { ApiError } from './api-error.js';

export class PartnerApplicationNotFoundError extends ApiError {
  constructor(id: string) {
    super({
      statusCode: 404,
      message: `No partner application found with id "${id}".`,
    });
  }
}

export class PartnerApplicationForbiddenError extends ApiError {
  constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage partner applications.',
    });
  }
}

export class PartnerApplicationInvalidStateError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}
