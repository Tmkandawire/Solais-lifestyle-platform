import type { Order } from "./order";
import type { PaymentProvider } from "./payment-provider";
import type { PaymentStatus } from "./payment-status";

export interface Payment {
  id: string;
  orderId: string;

  provider: PaymentProvider;
  status: PaymentStatus;

  amount: string;
  currency: string;

  providerReference: string | null;
  failureReason: string | null;
  paidAt: string | null;

  createdAt: string;
  updatedAt: string;

  order?: Order;
}

export interface CreatePaymentPayload {
  orderId: string;
  provider: PaymentProvider;
}
