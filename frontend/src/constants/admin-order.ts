import type { OrderStatus } from "../types/order-status";
import type {
  AdminIssuedTicketStatus,
  AdminPaymentProvider,
  AdminPaymentStatus,
} from "../types/admin-order";

export const ADMIN_ORDERS_PAGE_SIZE = 20;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Awaiting payment",
  PAID: "Paid",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const PAYMENT_STATUS_LABELS: Record<AdminPaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

/**
 * PLACEHOLDER providers. This is the single place to edit when the client
 * confirms the real payment providers (alongside the Prisma enum and the
 * AdminPaymentProvider union). Record<> makes the compiler flag any drift.
 */
export const PAYMENT_PROVIDER_LABELS: Record<AdminPaymentProvider, string> = {
  TNM_MPAMBA: "TNM Mpamba",
  AIRTEL_MONEY: "Airtel Money",
  BANK_CARD: "Bank card",
};

export const ISSUED_TICKET_STATUS_LABELS: Record<
  AdminIssuedTicketStatus,
  string
> = {
  ISSUED: "Issued",
  CHECKED_IN: "Checked in",
  CANCELLED: "Cancelled",
};

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export function optionsFrom<T extends string>(
  labels: Record<T, string>,
): SelectOption<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}
