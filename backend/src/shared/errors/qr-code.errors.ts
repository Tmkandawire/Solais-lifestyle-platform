import { ApiError } from './api-error.js';

export class QrCodeGenerationError extends ApiError {
  public constructor() {
    super({
      statusCode: 500,
      message: 'Failed to generate the ticket QR code.',
    });
  }
}

export class InvalidQrPayloadError extends ApiError {
  public constructor(reason: string) {
    super({
      statusCode: 400,
      message: `Invalid or tampered QR code: ${reason}`,
      code: 'INVALID_QR_PAYLOAD',
    });
  }
}
