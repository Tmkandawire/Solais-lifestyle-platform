import { ApiError } from './api-error.js';

export class OrderNotFoundError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 404,
      message: `No order found with id "${id}".`,
    });
  }
}

export class OrderForbiddenError extends ApiError {
  public constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage this order.',
    });
  }
}

export class OrderInvalidStateError extends ApiError {
  public constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}
