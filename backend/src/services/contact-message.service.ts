import type { ContactMessageStatus } from '../generated/prisma/enums.js';
import {
  createContactMessage,
  deleteContactMessageById,
  findContactMessageById,
  findContactMessages,
  updateContactMessageStatus,
  type ContactMessageFilters,
} from '../repositories/contact-message.repository.js';
import { ApiError } from '../shared/errors/api-error.js';
import type { CreateContactMessageInput } from '../modules/contact-messages/contact-message.schemas.js';

function notFound(): ApiError {
  return new ApiError({
    statusCode: 404,
    message: 'Contact message not found.',
  });
}

export async function submitContactMessage(data: CreateContactMessageInput) {
  const message = await createContactMessage({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone?.trim() || null,
    subject: data.subject,
    message: data.message,
  });

  // Never expose the stored message or internal metadata
  // in the public submission response.
  return { id: message.id };
}

export function listContactMessages(filters: ContactMessageFilters) {
  return findContactMessages(filters);
}

export async function getContactMessageById(id: string) {
  const message = await findContactMessageById(id);

  if (!message) {
    throw notFound();
  }

  return message;
}

export async function changeContactMessageStatus(id: string, status: ContactMessageStatus) {
  await getContactMessageById(id);
  return updateContactMessageStatus(id, status);
}

export async function removeContactMessage(id: string) {
  await getContactMessageById(id);
  await deleteContactMessageById(id);
}
