import { ApiError } from './api-error.js';

export class EventNotFoundError extends ApiError {
  constructor(id: string) {
    super({
      statusCode: 404,
      message: `No event found with id "${id}".`,
    });
  }
}

export class EventForbiddenError extends ApiError {
  constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage events.',
    });
  }
}

export class EventInvalidStateError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}
