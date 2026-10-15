import type { AnnouncementStatus } from '../generated/prisma/client.js';
import {
  createAnnouncement,
  deleteAnnouncement,
  findAnnouncementById,
  findAnnouncements,
  findPublishedAnnouncements,
  updateAnnouncement,
  type AnnouncementListFilters,
  hasUnreadAnnouncements,
  markAnnouncementsSeen,
} from '../repositories/announcement.repository.js';
import { ApiError } from '../shared/errors/api-error.js';

interface AnnouncementInput {
  title: string;
  message: string;
}

const MAX_TITLE_LENGTH = 200;
const MAX_MESSAGE_LENGTH = 5000;

function notFound(): ApiError {
  return new ApiError({
    statusCode: 404,
    message: 'Announcement not found.',
  });
}

function normalizeInput(input: AnnouncementInput): AnnouncementInput {
  const title = input.title.trim();
  const message = input.message.trim();

  if (!title || title.length > MAX_TITLE_LENGTH) {
    throw new ApiError({
      statusCode: 400,
      message: `Announcement title must contain 1–${MAX_TITLE_LENGTH} characters.`,
    });
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    throw new ApiError({
      statusCode: 400,
      message: `Announcement message must contain 1–${MAX_MESSAGE_LENGTH} characters.`,
    });
  }

  return { title, message };
}

export async function createAnnouncementDraft(input: AnnouncementInput) {
  const normalized = normalizeInput(input);

  return createAnnouncement({
    ...normalized,
    status: 'DRAFT',
  });
}

export function listAnnouncements(filters: AnnouncementListFilters) {
  return findAnnouncements(filters);
}

export function listPublishedAnnouncements(page: number, limit: number) {
  return findPublishedAnnouncements(page, limit);
}

export async function getAnnouncementById(id: string) {
  const announcement = await findAnnouncementById(id);

  if (!announcement) {
    throw notFound();
  }

  return announcement;
}

export async function editAnnouncement(id: string, input: AnnouncementInput) {
  const existing = await getAnnouncementById(id);
  const normalized = normalizeInput(input);

  if (existing.status === 'ARCHIVED') {
    throw new ApiError({
      statusCode: 409,
      message: 'Archived announcements cannot be edited.',
    });
  }

  return updateAnnouncement(id, normalized);
}

export async function changeAnnouncementStatus(
  id: string,
  status: Extract<AnnouncementStatus, 'PUBLISHED' | 'ARCHIVED'>,
) {
  const existing = await getAnnouncementById(id);

  if (existing.status === 'ARCHIVED') {
    throw new ApiError({
      statusCode: 409,
      message: 'Archived announcements cannot be changed.',
    });
  }

  if (status === 'PUBLISHED') {
    return updateAnnouncement(id, {
      status,
      publishedAt: existing.publishedAt ?? new Date(),
      archivedAt: null,
    });
  }

  return updateAnnouncement(id, {
    status,
    archivedAt: new Date(),
  });
}

export async function removeAnnouncement(id: string): Promise<void> {
  await getAnnouncementById(id);
  await deleteAnnouncement(id);
}

export async function getAnnouncementUnreadStatus(accountId: string) {
  return {
    hasNewAnnouncements: await hasUnreadAnnouncements(accountId),
  };
}

export async function markAnnouncementsAsSeen(accountId: string, seenThroughValue: string) {
  const seenThrough = new Date(seenThroughValue);

  if (Number.isNaN(seenThrough.getTime())) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid announcement timestamp.',
    });
  }

  const latestPublished = await findPublishedAnnouncements(1, 1);
  const latestAnnouncement = latestPublished.announcements[0];

  if (
    !latestAnnouncement ||
    !latestAnnouncement.publishedAt ||
    seenThrough > new Date(latestAnnouncement.publishedAt)
  ) {
    throw new ApiError({
      statusCode: 400,
      message: 'Invalid announcement timestamp.',
    });
  }

  await markAnnouncementsSeen(accountId, seenThrough);

  return { success: true };
}
