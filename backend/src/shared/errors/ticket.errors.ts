import { ApiError } from './api-error.js';

export class TicketTypeNotFoundError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 404,
      message: `No ticket type found with id "${id}".`,
    });
  }
}

export class TicketForbiddenError extends ApiError {
  public constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to manage tickets.',
    });
  }
}

export class TicketInvalidStateError extends ApiError {
  public constructor(message: string) {
    super({
      statusCode: 409,
      message,
    });
  }
}

export class TicketInventoryUnavailableError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 409,
      message: `There is not enough available inventory for ticket type "${id}".`,
    });
  }
}

export class InvalidTicketQuantityError extends ApiError {
  public constructor() {
    super({
      statusCode: 400,
      message: 'Ticket quantity must be a positive whole number.',
    });
  }
}
