export type AdminAttendeeRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "ATTENDEE"
  | "VENDOR"
  | "PARTNER";

export type AdminAttendeeOrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "EXPIRED";

export type AdminAttendeePaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type AdminAttendeePaymentProvider =
  | "TNM_MPAMBA"
  | "AIRTEL_MONEY"
  | "BANK_CARD";

export type AdminAttendeeTicketStatus = "ISSUED" | "CHECKED_IN" | "CANCELLED";

export interface AdminAttendeeListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminAttendeeRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  _count: {
    orders: number;
    issuedTickets: number;
  };
}

export interface AdminAttendeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface AdminAttendeeListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAttendeeList {
  attendees: AdminAttendeeListItem[];
  meta: AdminAttendeeListMeta;
}

export interface AdminAttendeeEvent {
  id: string;
  title: string;
  startDate: string;
  venue: string;
  city: string;
}

export interface AdminAttendeeOrderItem {
  id: string;
  ticketTypeName: string;
  quantity: number;
  unitPrice: string;
}

export interface AdminAttendeePayment {
  id: string;
  status: AdminAttendeePaymentStatus;
  provider: AdminAttendeePaymentProvider;
  amount: string;
  currency: string;
  paidAt: string | null;
}

export interface AdminAttendeeOrder {
  id: string;
  status: AdminAttendeeOrderStatus;
  totalAmount: string;
  currency: string;
  createdAt: string;
  expiresAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  event: AdminAttendeeEvent;
  payment: AdminAttendeePayment | null;
  items: AdminAttendeeOrderItem[];
}

export interface AdminAttendeeIssuedTicket {
  id: string;
  ticketNumber: string;
  status: AdminAttendeeTicketStatus;
  checkedInAt: string | null;
  createdAt: string;
  ticketTypeId: string;
  orderItem: {
    ticketTypeName: string;
    unitPrice: string;
    order: {
      id: string;
      status: AdminAttendeeOrderStatus;
      currency: string;
      event: AdminAttendeeEvent;
    };
  };
}

export interface AdminAttendeeDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminAttendeeRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    issuedTickets: number;
  };
  orders: AdminAttendeeOrder[];
  issuedTickets: AdminAttendeeIssuedTicket[];
}
