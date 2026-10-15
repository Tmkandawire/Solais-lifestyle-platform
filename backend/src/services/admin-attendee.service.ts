import { Role } from '../generated/prisma/enums.js';
import type { AdminAttendeeListQueryInput } from '../modules/attendees/admin-attendee.schemas.js';
import {
  findAdminAttendeeById,
  findAdminAttendees,
} from '../repositories/admin-attendee.repository.js';
import { AccountNotFoundError } from '../shared/errors/account.errors.js';
import { OrderForbiddenError } from '../shared/errors/order.errors.js';

export interface AdminAttendeeActor {
  accountId: string;
  role: Role;
}

function assertAdminActor(actor: AdminAttendeeActor): void {
  if (actor.role !== Role.ADMIN && actor.role !== Role.SUPER_ADMIN) {
    throw new OrderForbiddenError();
  }
}

export async function listAdminAttendees(
  actor: AdminAttendeeActor,
  query: AdminAttendeeListQueryInput,
) {
  assertAdminActor(actor);

  return findAdminAttendees({
    page: query.page,
    limit: query.limit,
    ...(query.search !== undefined ? { search: query.search } : {}),
    ...(query.isActive !== undefined ? { isActive: query.isActive === 'true' } : {}),
  });
}

export async function getAdminAttendee(actor: AdminAttendeeActor, id: string) {
  assertAdminActor(actor);

  const attendee = await findAdminAttendeeById(id);

  if (!attendee) {
    throw new AccountNotFoundError(id);
  }

  return attendee;
}
