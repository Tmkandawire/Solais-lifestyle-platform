import { ArrowLeft, CalendarDays, Loader2, Save, Ticket } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useAdminEvent } from "../../../../hooks/useAdminEvent";
import {
  useAdminTicket,
  useUpdateTicketType,
} from "../../../../hooks/useAdminTicket";
import { useToast } from "../../../../hooks/useToast";

import type { UpdateTicketTypePayload } from "../../../../types/ticket";

const CURRENCY = "ZMW";

type FormState = {
  name: string;
  description: string;
  price: string;
  capacity: string;
  saleStartAt: string;
  saleEndAt: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  ].join("T");
}

function formatCurrency(value: string): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${CURRENCY} 0.00`;
  }

  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-MW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function validateForm(form: FormState, soldQuantity: number): FormErrors {
  const errors: FormErrors = {};

  const name = form.name.trim();
  const price = Number(form.price);
  const capacity = Number(form.capacity);

  if (!name) {
    errors.name = "Ticket type name is required.";
  } else if (name.length > 120) {
    errors.name = "Ticket type name cannot exceed 120 characters.";
  }

  if (!form.price.trim()) {
    errors.price = "Price is required.";
  } else if (!Number.isFinite(price) || price < 0) {
    errors.price = "Enter a valid non-negative price.";
  }

  if (!form.capacity.trim()) {
    errors.capacity = "Capacity is required.";
  } else if (!Number.isInteger(capacity) || capacity <= 0) {
    errors.capacity = "Capacity must be a positive whole number.";
  } else if (capacity < soldQuantity) {
    errors.capacity = `Capacity cannot be below the ${soldQuantity} ticket${
      soldQuantity === 1 ? "" : "s"
    } already sold.`;
  }

  if (form.saleStartAt && form.saleEndAt) {
    const start = new Date(form.saleStartAt);
    const end = new Date(form.saleEndAt);

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end <= start
    ) {
      errors.saleEndAt = "Sale end must be after sale start.";
    }
  }

  return errors;
}

function getInitialForm(ticketType: {
  name: string;
  description: string | null;
  price: string;
  capacity: number;
  saleStartAt: string | null;
  saleEndAt: string | null;
}): FormState {
  return {
    name: ticketType.name,
    description: ticketType.description ?? "",
    price: ticketType.price,
    capacity: String(ticketType.capacity),
    saleStartAt: toDateTimeLocal(ticketType.saleStartAt),
    saleEndAt: toDateTimeLocal(ticketType.saleEndAt),
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs leading-5 text-[#704545]">{message}</p>;
}

export default function AdminTicketTypeEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();

  const toast = useToast();

  const {
    ticketType,
    isLoading: isTicketLoading,
    error: ticketError,
  } = useAdminTicket(id);

  const eventIdFromQuery = searchParams.get("eventId") ?? undefined;

  const eventId = ticketType?.eventId ?? eventIdFromQuery;

  const { event, isLoading: isEventLoading } = useAdminEvent(eventId);

  const { update, isLoading: isUpdating } = useUpdateTicketType();

  const [formOverrides, setFormOverrides] = useState<Partial<FormState> | null>(
    null,
  );

  const [errors, setErrors] = useState<FormErrors>({});

  const soldQuantity = ticketType?.soldQuantity ?? 0;

  const initialForm = useMemo(
    () => (ticketType ? getInitialForm(ticketType) : null),
    [ticketType],
  );

  const form: FormState = {
    ...(initialForm ?? {
      name: "",
      description: "",
      price: "",
      capacity: "",
      saleStartAt: "",
      saleEndAt: "",
    }),
    ...(formOverrides ?? {}),
  };

  const hasChanges =
    initialForm !== null &&
    Object.keys(formOverrides ?? {}).some(
      (field) =>
        formOverrides?.[field as keyof FormState] !==
        initialForm[field as keyof FormState],
    );

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setFormOverrides((current) => ({
      ...(current ?? {}),
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (eventSubmit: FormEvent<HTMLFormElement>) => {
    eventSubmit.preventDefault();

    if (!id || !ticketType) {
      return;
    }

    const validationErrors = validateForm(form, soldQuantity);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      toast.error("Please correct the highlighted fields.", {
        description: "The ticket type could not be updated.",
      });

      return;
    }

    const payload: UpdateTicketTypePayload = {
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      price: form.price.trim(),
      capacity: Number(form.capacity),
      saleStartAt: form.saleStartAt
        ? new Date(form.saleStartAt).toISOString()
        : null,
      saleEndAt: form.saleEndAt ? new Date(form.saleEndAt).toISOString() : null,
    };

    try {
      await update(id, payload);

      toast.success("Ticket type updated.", {
        description: `${form.name.trim()} has been updated successfully.`,
      });

      navigate(
        eventId
          ? `/admin/tickets/${id}?eventId=${encodeURIComponent(eventId)}`
          : `/admin/tickets/${id}`,
      );
    } catch {
      toast.error("Unable to update ticket type.", {
        description: "Please review the ticket details and try again.",
      });
    }
  };

  const handleCancel = () => {
    if (!id) {
      navigate("/admin/tickets");
      return;
    }

    navigate(
      eventId
        ? `/admin/tickets/${id}?eventId=${encodeURIComponent(eventId)}`
        : `/admin/tickets/${id}`,
    );
  };

  if (isTicketLoading && !ticketType) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-[#5f6462]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading ticket type...
          </div>
        </div>
      </main>
    );
  }

  if (ticketError && !ticketType) {
    return (
      <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6462] transition hover:text-[#122425]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ticket types
          </button>

          <div className="rounded-2xl border border-[#704545]/20 bg-[#f7f3ed] p-6 shadow-[0_18px_50px_rgba(18,36,37,0.08)]">
            <h1 className="font-serif text-2xl text-[#122425]">
              Ticket type unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-[#5f6462]">
              {ticketError}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!ticketType) {
    return null;
  }

  const isBusy = isUpdating || isTicketLoading || isEventLoading;

  return (
    <main className="min-h-screen bg-[#f7f3ed] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#5f6462] transition hover:text-[#122425]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ticket type
          </button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#806238]">
                Ticket Management
              </p>

              <h1 className="font-serif text-3xl leading-tight text-[#122425] sm:text-4xl">
                Edit ticket type
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6462]">
                Update the ticket information, pricing, inventory and sale
                window.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[#122425]/10 bg-[#efe7dc] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#122425] lg:self-auto">
              <span
                className={`h-2 w-2 rounded-full ${
                  ticketType.status === "ACTIVE"
                    ? "bg-[#315f49]"
                    : "bg-[#806238]"
                }`}
              />
              {ticketType.status}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-[#122425]/10 bg-[#f7f3ed] p-5 shadow-[0_18px_50px_rgba(18,36,37,0.08)] sm:p-7"
          >
            <div className="mb-7 border-b border-[#122425]/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#122425] text-[#f7f3ed]">
                  <Ticket className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#122425]">
                    Ticket details
                  </h2>

                  <p className="mt-0.5 text-xs text-[#5f6462]">
                    Update the public-facing ticket information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="ticket-name"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                >
                  Ticket name
                </label>

                <input
                  id="ticket-name"
                  type="text"
                  value={form.name}
                  onChange={(eventInput) =>
                    updateField("name", eventInput.target.value)
                  }
                  disabled={isBusy}
                  placeholder="e.g. General Admission"
                  className="w-full rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 text-sm text-[#122425] outline-none transition placeholder:text-[#5f6462]/50 focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <FieldError message={errors.name} />
              </div>

              <div>
                <label
                  htmlFor="ticket-description"
                  className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                >
                  Description
                </label>

                <textarea
                  id="ticket-description"
                  value={form.description}
                  onChange={(eventInput) =>
                    updateField("description", eventInput.target.value)
                  }
                  disabled={isBusy}
                  rows={5}
                  placeholder="Describe what this ticket includes..."
                  className="w-full resize-y rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 text-sm leading-6 text-[#122425] outline-none transition placeholder:text-[#5f6462]/50 focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <FieldError message={errors.description} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ticket-price"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                  >
                    Price · {CURRENCY}
                  </label>

                  <div className="relative">
                    <input
                      id="ticket-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(eventInput) =>
                        updateField("price", eventInput.target.value)
                      }
                      disabled={isBusy}
                      className="w-full rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 pr-16 text-sm text-[#122425] outline-none transition focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[10px] font-semibold uppercase tracking-widest text-[#5f6462]">
                      {CURRENCY}
                    </span>
                  </div>

                  <FieldError message={errors.price} />
                </div>

                <div>
                  <label
                    htmlFor="ticket-capacity"
                    className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                  >
                    Capacity
                  </label>

                  <input
                    id="ticket-capacity"
                    type="number"
                    min={Math.max(1, soldQuantity)}
                    step="1"
                    value={form.capacity}
                    onChange={(eventInput) =>
                      updateField("capacity", eventInput.target.value)
                    }
                    disabled={isBusy}
                    className="w-full rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 text-sm text-[#122425] outline-none transition focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-[11px] leading-5 text-[#5f6462]">
                    {soldQuantity}{" "}
                    {soldQuantity === 1 ? "ticket has" : "tickets have"} already
                    been sold.
                  </p>

                  <FieldError message={errors.capacity} />
                </div>
              </div>

              <div className="border-t border-[#122425]/10 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <CalendarDays className="h-4 w-4 text-[#806238]" />

                  <div>
                    <h3 className="text-sm font-semibold text-[#122425]">
                      Sale window
                    </h3>

                    <p className="mt-0.5 text-xs text-[#5f6462]">
                      Leave either field empty if there is no corresponding
                      restriction.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ticket-sale-start"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                    >
                      Sale starts
                    </label>

                    <input
                      id="ticket-sale-start"
                      type="datetime-local"
                      value={form.saleStartAt}
                      onChange={(eventInput) =>
                        updateField("saleStartAt", eventInput.target.value)
                      }
                      disabled={isBusy}
                      className="w-full rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 text-sm text-[#122425] outline-none transition focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <FieldError message={errors.saleStartAt} />
                  </div>

                  <div>
                    <label
                      htmlFor="ticket-sale-end"
                      className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#122425]"
                    >
                      Sale ends
                    </label>

                    <input
                      id="ticket-sale-end"
                      type="datetime-local"
                      value={form.saleEndAt}
                      onChange={(eventInput) =>
                        updateField("saleEndAt", eventInput.target.value)
                      }
                      disabled={isBusy}
                      className="w-full rounded-xl border border-[#122425]/10 bg-white/60 px-4 py-3 text-sm text-[#122425] outline-none transition focus:border-[#122425]/30 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <FieldError message={errors.saleEndAt} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#122425]/10 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isUpdating}
                className="rounded-full border border-[#122425]/10 bg-[#efe7dc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425] transition hover:bg-[#e6dccf] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isBusy || !hasChanges}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#122425] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f7f3ed] transition hover:bg-[#1d3637] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </form>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#122425]/10 bg-[#efe7dc] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#806238]">
                Event
              </p>

              <h2 className="mt-2 font-serif text-xl leading-tight text-[#122425]">
                {event?.title ?? "Event"}
              </h2>

              {event?.startDate && (
                <p className="mt-2 text-xs leading-5 text-[#5f6462]">
                  {formatDate(event.startDate)}
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-[#122425]/10 bg-[#f7f3ed] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#806238]">
                Current inventory
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#122425]/10 bg-white/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5f6462]">
                    Capacity
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#122425]">
                    {ticketType.capacity}
                  </p>
                </div>

                <div className="rounded-xl border border-[#122425]/10 bg-white/40 p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#5f6462]">
                    Sold
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#122425]">
                    {ticketType.soldQuantity}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-[#122425]/10 pt-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#5f6462]">
                  Current price
                </p>

                <p className="mt-1 text-lg font-semibold text-[#122425]">
                  {formatCurrency(ticketType.price)}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#806238]/20 bg-[#efe7dc] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#806238]">
                Lifecycle
              </p>

              <p className="mt-2 text-xs leading-5 text-[#5f6462]">
                Ticket status is managed separately through the Activate and
                Deactivate actions. Editing this form does not change the
                ticket's lifecycle status.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
