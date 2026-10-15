import QRCode from 'qrcode';

import { QrCodeGenerationError, InvalidQrPayloadError } from '../shared/errors/qr-code.errors.js';

export interface TicketQrPayload {
  v: 1;
  ticketId: string;
  ticketNumber: string;
  credential: string;
}

export interface GeneratedQrCode {
  payload: TicketQrPayload;
  dataUrl: string;
}

/**
 * Builds the payload encoded into an issued ticket's QR code.
 *
 * The credential is the raw, cryptographically generated ticket credential.
 * It is never persisted in the database. Only its hash is stored.
 */
export function buildTicketQrPayload(
  ticketId: string,
  ticketNumber: string,
  credential: string,
): TicketQrPayload {
  if (!ticketId || !ticketNumber || !credential) {
    throw new InvalidQrPayloadError(
      'ticketId, ticketNumber, and credential must all be non-empty.',
    );
  }

  return {
    v: 1,
    ticketId,
    ticketNumber,
    credential,
  };
}

/**
 * Generates a QR code containing an issued ticket's payload.
 *
 * Returns a data URL that can be embedded directly into an email,
 * HTML document, PDF, or ticket presentation layer.
 */
export async function generateTicketQrCode(payload: TicketQrPayload): Promise<GeneratedQrCode> {
  let dataUrl: string;

  try {
    dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 400,
    });
  } catch {
    throw new QrCodeGenerationError();
  }

  return {
    payload,
    dataUrl,
  };
}

/**
 * Builds and generates an issued ticket QR code in one operation.
 */
export async function createTicketQrCode(
  ticketId: string,
  ticketNumber: string,
  credential: string,
): Promise<GeneratedQrCode> {
  const payload = buildTicketQrPayload(ticketId, ticketNumber, credential);

  return await generateTicketQrCode(payload);
}

/**
 * Parses and validates a raw scanned QR payload string.
 *
 * This validates the structure of the payload only. It does not determine
 * whether the ticket or credential actually exists or is valid.
 */
export function parseTicketQrPayload(raw: string): TicketQrPayload {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidQrPayloadError('payload is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new InvalidQrPayloadError('payload is not an object.');
  }

  const candidate = parsed as Record<string, unknown>;

  if (candidate.v !== 1) {
    throw new InvalidQrPayloadError('unrecognized or missing payload version.');
  }

  if (
    typeof candidate.ticketId !== 'string' ||
    typeof candidate.ticketNumber !== 'string' ||
    typeof candidate.credential !== 'string' ||
    candidate.ticketId.length === 0 ||
    candidate.ticketNumber.length === 0 ||
    candidate.credential.length === 0
  ) {
    throw new InvalidQrPayloadError('missing or malformed ticket fields.');
  }

  return {
    v: 1,
    ticketId: candidate.ticketId,
    ticketNumber: candidate.ticketNumber,
    credential: candidate.credential,
  };
}
