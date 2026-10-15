import type { EventStatus } from '../../generated/prisma/enums.js';

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: Date;
  endDate: Date;
  bannerImageUrl: string | null;
  capacity: number | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicEventList {
  events: PublicEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
