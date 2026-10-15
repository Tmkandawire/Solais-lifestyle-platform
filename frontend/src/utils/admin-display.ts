const NOT_RECORDED = "Not recorded";
const DATE_UNAVAILABLE = "Date unavailable";
const AMOUNT_UNAVAILABLE = "Unavailable";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** A null entry means the currency code was rejected. */
const currencyFormatters = new Map<string, Intl.NumberFormat | null>();

type DateInput = string | null | undefined;

function formatWith(formatter: Intl.DateTimeFormat, value: DateInput): string {
  if (!value) return NOT_RECORDED;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? DATE_UNAVAILABLE
    : formatter.format(date);
}

export function formatDate(value: DateInput): string {
  return formatWith(DATE_FORMAT, value);
}

export function formatDateTime(value: DateInput): string {
  return formatWith(DATE_TIME_FORMAT, value);
}

function getCurrencyFormatter(currency: string): Intl.NumberFormat | null {
  const cached = currencyFormatters.get(currency);
  if (cached !== undefined) return cached;

  let formatter: Intl.NumberFormat | null;

  try {
    formatter = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    formatter = null;
  }

  currencyFormatters.set(currency, formatter);
  return formatter;
}

function toAmount(value: string | number): number {
  if (typeof value === "string" && value.trim() === "") {
    return Number.NaN;
  }

  return Number(value);
}

export function formatMoney(value: string | number, currency: string): string {
  const amount = toAmount(value);

  if (!Number.isFinite(amount)) {
    return `${currency} ${value}`;
  }

  const formatter = getCurrencyFormatter(currency);

  return formatter
    ? formatter.format(amount)
    : `${currency} ${amount.toFixed(2)}`;
}

const DECIMAL_PATTERN = /^(-?)(\d+)(?:\.(\d{1,2}))?$/;

/**
 * Parses decimal strings directly into minor units to avoid floating-point
 * multiplication for monetary values received through the API.
 */
function toMinorUnits(value: string | number): number {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const match = DECIMAL_PATTERN.exec(trimmed);

    if (match) {
      const [, sign, whole, fraction = ""] = match;
      const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

      return sign ? -cents : cents;
    }

    // Reject malformed decimal strings instead of silently rounding them.
    if (/^-?\d+\.\d+$/.test(trimmed)) {
      return Number.NaN;
    }
  }

  const amount = toAmount(value);

  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

/**
 * Returns "Unavailable" for invalid amounts or quantities so corrupt data
 * cannot be mistaken for a valid zero-value subtotal.
 */
export function multiplyMoney(
  unitPrice: string | number,
  quantity: number,
): string {
  const cents = toMinorUnits(unitPrice);

  if (
    !Number.isSafeInteger(cents) ||
    !Number.isSafeInteger(quantity) ||
    quantity < 0
  ) {
    return AMOUNT_UNAVAILABLE;
  }

  const subtotalCents = cents * quantity;

  if (!Number.isSafeInteger(subtotalCents)) {
    return AMOUNT_UNAVAILABLE;
  }

  return (subtotalCents / 100).toFixed(2);
}
