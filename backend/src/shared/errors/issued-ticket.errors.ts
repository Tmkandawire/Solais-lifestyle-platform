import { ApiError } from './api-error.js';

export class IssuedTicketNotFoundError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 404,
      message: `No issued ticket found with id "${id}".`,
      code: 'TICKET_NOT_FOUND',
    });
  }
}

export class IssuedTicketAlreadyCheckedInError extends ApiError {
  public constructor(
    id: string,
    details: {
      ticketNumber: string;
      checkedInAt: Date | null;
    },
  ) {
    super({
      statusCode: 409,
      message: `Issued ticket "${id}" has already been checked in.`,
      code: 'TICKET_ALREADY_CHECKED_IN',
      data: {
        ticketNumber: details.ticketNumber,
        checkedInAt: details.checkedInAt?.toISOString() ?? null,
      },
    });
  }
}

export class IssuedTicketCancelledError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 409,
      message: `Issued ticket "${id}" has been cancelled.`,
      code: 'TICKET_CANCELLED',
    });
  }
}

export class IssuedTicketForbiddenError extends ApiError {
  public constructor() {
    super({
      statusCode: 403,
      message: 'You are not authorized to view or manage this ticket.',
      code: 'TICKET_FORBIDDEN',
    });
  }
}

export class IssuedTicketCredentialNotFoundError extends ApiError {
  public constructor() {
    super({
      statusCode: 404,
      message: 'No issued ticket matches the supplied QR credential.',
      code: 'TICKET_CREDENTIAL_NOT_FOUND',
    });
  }
}

export class IssuedTicketEventMismatchError extends ApiError {
  constructor() {
    super({
      statusCode: 409,
      message: 'This ticket does not belong to the selected event.',
      code: 'TICKET_EVENT_MISMATCH',
    });
  }
}
