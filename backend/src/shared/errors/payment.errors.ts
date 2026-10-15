import { ApiError } from './api-error.js';

export class PaymentNotFoundError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 404,
      message: `No payment found with id "${id}".`,
    });
  }
}

export class PaymentForbiddenError extends ApiError {
  public constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage this payment.',
    });
  }
}

export class PaymentInvalidStateError extends ApiError {
  public constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}
