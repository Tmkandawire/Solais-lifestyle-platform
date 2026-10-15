import type { OrderStatus } from "./order-status";

/**
 * Admin order contracts. These mirror the Prisma enums and the shape returned
 * by GET /admin/orders and GET /admin/orders/:id. Money and dates are strings
 * because they are serialized over JSON.
 */

export type AdminPaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

/**
 * PLACEHOLDER: mirrors the Prisma PaymentProvider enum, whose values are not
 * final. When the client names the real providers, change the Prisma enum, this
 * union, and PAYMENT_PROVIDER_LABELS in constants/admin-order.ts together.
 * The labels map is a Record over this union, so the compiler flags any drift.
 */
export type AdminPaymentProvider = "TNM_MPAMBA" | "AIRTEL_MONEY" | "BANK_CARD";

export type AdminIssuedTicketStatus = "ISSUED" | "CHECKED_IN" | "CANCELLED";

export type AdminEventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "CANCELLED"
  | "COMPLETED";

export interface AdminOrderAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "ATTENDEE" | "VENDOR" | "PARTNER";
  isActive: boolean;
}

export interface AdminOrderEvent {
  id: string;
  title: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  status: AdminEventStatus;
}

export interface AdminOrderPayment {
  id: string;
  status: AdminPaymentStatus;
  provider: AdminPaymentProvider;
  amount: string;
  currency: string;
  providerReference: string | null;
  failureReason: string | null;
  paidAt: string | null;
}

/** Deliberately has no QR fields: the backend whitelists what it returns. */
export interface AdminIssuedTicket {
  id: string;
  ticketNumber: string;
  status: AdminIssuedTicketStatus;
  checkedInAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderItem {
  id: string;
  orderId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: string;
  createdAt: string;
  issuedTickets: AdminIssuedTicket[];
}

export interface AdminOrder {
  id: string;
  accountId: string;
  eventId: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;
  expiresAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  account: AdminOrderAccount;
  event: AdminOrderEvent;
  items: AdminOrderItem[];
  payment: AdminOrderPayment | null;
}

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  eventId?: string;
  paymentStatus?: AdminPaymentStatus;
  paymentProvider?: AdminPaymentProvider;
  search?: string;
}

export interface AdminOrderListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOrderList {
  orders: AdminOrder[];
  meta: AdminOrderListMeta;
}
