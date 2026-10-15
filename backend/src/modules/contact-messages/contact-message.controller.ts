import type { Request, Response } from 'express';

import {
  changeContactMessageStatus,
  getContactMessageById,
  listContactMessages,
  removeContactMessage,
  submitContactMessage,
} from '../../services/contact-message.service.js';
import { successResponse } from '../../shared/responses/api-response.js';

import type {
  ContactMessageIdInput,
  ContactMessageListQueryInput,
  CreateContactMessageInput,
  UpdateContactMessageStatusInput,
} from './contact-message.schemas.js';

type IdRequest = Request<ContactMessageIdInput>;

type CreateRequest = Request<Record<string, never>, unknown, CreateContactMessageInput>;

type StatusRequest = Request<ContactMessageIdInput, unknown, UpdateContactMessageStatusInput>;

export async function createContactMessageHandler(
  request: CreateRequest,
  response: Response,
): Promise<void> {
  const result = await submitContactMessage(request.body);

  response
    .status(201)
    .json(successResponse('Your enquiry has been submitted successfully.', result));
}

export async function listContactMessagesHandler(
  _request: Request,
  response: Response,
): Promise<void> {
  const query = response.locals.validatedQuery as ContactMessageListQueryInput;

  const result = await listContactMessages({
    page: query.page,
    limit: query.limit,
    ...(query.status ? { status: query.status } : {}),
    ...(query.search ? { search: query.search } : {}),
  });

  response.json(successResponse('Contact messages retrieved successfully.', result));
}

export async function getContactMessageHandler(
  request: IdRequest,
  response: Response,
): Promise<void> {
  const message = await getContactMessageById(request.params.id);

  response.json(successResponse('Contact message retrieved successfully.', message));
}

export async function updateContactMessageStatusHandler(
  request: StatusRequest,
  response: Response,
): Promise<void> {
  const message = await changeContactMessageStatus(request.params.id, request.body.status);

  response.json(successResponse('Contact message status updated successfully.', message));
}

export async function deleteContactMessageHandler(
  request: IdRequest,
  response: Response,
): Promise<void> {
  await removeContactMessage(request.params.id);

  response.json(successResponse('Contact message deleted successfully.', null));
}
