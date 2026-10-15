import { apiClient } from "./client";
import type { ApiSuccessResponse } from "../types/api";
import type { CreatePaymentPayload, Payment } from "../types/payment";

type PaymentResponse = ApiSuccessResponse<Payment>;

/** POST /payments — backend resolves amount, currency and validation. */
export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await apiClient.post<PaymentResponse>("/payments", payload);
  return response.data.data;
}

/** GET /payments/:id */
export async function getPaymentById(id: string): Promise<Payment> {
  const response = await apiClient.get<PaymentResponse>(`/payments/${id}`);
  return response.data.data;
}
