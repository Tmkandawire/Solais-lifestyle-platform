import type {
  AdminAttendeeOrderStatus,
  AdminAttendeePaymentStatus,
  AdminAttendeeTicketStatus,
} from "../types/admin-attendee";

export const ADMIN_ATTENDEES_PAGE_SIZE = 20;

export const ATTENDEE_ORDER_STATUS_LABELS: Record<
  AdminAttendeeOrderStatus,
  string
> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const ATTENDEE_PAYMENT_STATUS_LABELS: Record<
  AdminAttendeePaymentStatus,
  string
> = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const ATTENDEE_TICKET_STATUS_LABELS: Record<
  AdminAttendeeTicketStatus,
  string
> = {
  ISSUED: "Issued",
  CHECKED_IN: "Checked in",
  CANCELLED: "Cancelled",
};
