export const PAYMENT_PROVIDERS = [
  "TNM_MPAMBA",
  "AIRTEL_MONEY",
  "BANK_CARD",
] as const;

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];
