import { type FormEvent, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Save,
  Ticket,
  Users,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { useAdminEvent } from "../../../../hooks/useAdminEvent";
import { useCreateTicketType } from "../../../../hooks/useAdminTicket";
import { useToast } from "../../../../hooks/useToast";

import type { CreateTicketTypePayload } from "../../../../types/ticket";

interface TicketTypeFormState {
  name: string;
  description: string;
  price: string;
  capacity: string;
  saleStartAt: string;
  saleEndAt: string;
}

const initialFormState: TicketTypeFormState = {
  name: "",
  description: "",
  price: "",
  capacity: "",
  saleStartAt: "",
  saleEndAt: "",
};

const inputClassName =
  "h-12 w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 text-sm text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/70 focus:bg-white focus:ring-4 focus:ring-[#c99b55]/8";

const textareaClassName =
  "w-full resize-y rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm leading-6 text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/70 focus:bg-white focus:ring-4 focus:ring-[#c99b55]/8";

const labelClassName =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#122425]/65";

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

function formatEventDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Event dates unavailable";
  }

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const startDateLabel = dateFormatter.format(start);
  const endDateLabel = dateFormatter.format(end);

  if (startDateLabel === endDateLabel) {
    return `${startDateLabel} · ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  }

  return `${startDateLabel} – ${endDateLabel}`;
}

function getEventStatusClasses(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "border-[#2f6b4f]/20 bg-[#2f6b4f]/8 text-[#2f6b4f]";

    case "CANCELLED":
      return "border-[#a84b45]/20 bg-[#a84b45]/8 text-[#a84b45]";

    case "COMPLETED":
      return "border-[#476b8a]/20 bg-[#476b8a]/8 text-[#476b8a]";

    case "DRAFT":
    default:
      return "border-[#c99b55]/25 bg-[#c99b55]/10 text-[#8d692f]";
  }
}

function getEventStatusLabel(status: string) {
  switch (status) {
    case "PUBLISHED":
      return "Published";

    case "CANCELLED":
      return "Cancelled";

    case "COMPLETED":
      return "Completed";

    case "DRAFT":
    default:
      return "Draft";
  }
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Ticket;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#122425]/8 px-5 py-5 sm:px-7">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f1e9] text-[#c99b55]">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>

        <div className="min-w-0">
          <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
            {eyebrow}
          </p>

          <h2 className="font-serif text-xl italic text-[#122425]">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-[#122425]/45">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminCreateTicketTypePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId") ?? "";

  const toast = useToast();

  const {
    event,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useAdminEvent(eventId || undefined);

  const { create, isLoading, error } = useCreateTicketType();

  const [form, setForm] = useState<TicketTypeFormState>(initialFormState);

  const [validationError, setValidationError] = useState<string | null>(null);

  function updateField<K extends keyof TicketTypeFormState>(
    field: K,
    value: TicketTypeFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (validationError) {
      setValidationError(null);
    }
  }

  function validateForm() {
    if (!eventId) {
      return "An event must be selected before creating a ticket type.";
    }

    if (!event) {
      return "The selected event could not be found.";
    }

    if (event.status === "CANCELLED" || event.status === "COMPLETED") {
      return `Ticket types cannot be created for ${getEventStatusLabel(
        event.status,
      ).toLowerCase()} events.`;
    }

    if (!form.name.trim()) {
      return "Ticket type name is required.";
    }

    if (form.name.trim().length > 100) {
      return "Ticket type name must be 100 characters or fewer.";
    }

    if (form.description.trim().length > 1000) {
      return "Description must be 1000 characters or fewer.";
    }

    if (!form.price.trim()) {
      return "Ticket price is required.";
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      return "Ticket price must be a valid non-negative amount.";
    }

    if (!/^\d+(\.\d{1,2})?$/.test(form.price.trim())) {
      return "Ticket price may contain a maximum of two decimal places.";
    }

    if (!form.capacity.trim()) {
      return "Ticket capacity is required.";
    }

    const capacity = Number(form.capacity);

    if (!Number.isInteger(capacity) || capacity <= 0) {
      return "Capacity must be a positive whole number.";
    }

    if (form.saleStartAt) {
      const saleStart = new Date(form.saleStartAt);

      if (Number.isNaN(saleStart.getTime())) {
        return "Please provide a valid sale start date and time.";
      }

      if (saleStart < new Date()) {
        return "Sale start cannot be in the past.";
      }
    }

    if (form.saleEndAt) {
      const saleEnd = new Date(form.saleEndAt);

      if (Number.isNaN(saleEnd.getTime())) {
        return "Please provide a valid sale end date and time.";
      }

      if (form.saleStartAt) {
        const saleStart = new Date(form.saleStartAt);

        if (saleEnd <= saleStart) {
          return "Sale end must be after sale start.";
        }
      }
    }

    return null;
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    const payload: CreateTicketTypePayload = {
      eventId,

      name: form.name.trim(),

      description: form.description.trim() ? form.description.trim() : null,

      price: form.price.trim(),

      capacity: Number(form.capacity),

      ...(form.saleStartAt
        ? {
            saleStartAt: new Date(form.saleStartAt).toISOString(),
          }
        : {}),

      ...(form.saleEndAt
        ? {
            saleEndAt: new Date(form.saleEndAt).toISOString(),
          }
        : {}),
    };

    try {
      await create(payload);

      toast.success("Ticket type created successfully.", {
        description: `"${form.name.trim()}" is now available in the event's ticket catalogue.`,
      });

      navigate(`/admin/tickets?eventId=${encodeURIComponent(eventId)}`);
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  if (!eventId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#a84b45]/10 text-[#a84b45]">
            <Ticket className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <h1 className="mt-4 font-serif text-2xl italic text-[#122425] sm:text-3xl">
            Event required
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#122425]/50">
            Select an event before creating a ticket type.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334]"
          >
            Back to ticket types
          </button>
        </div>
      </div>
    );
  }

  if (isLoadingEvent) {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-0">
        <div className="mb-8 space-y-4">
          <div className="h-4 w-32 rounded bg-[#122425]/8" />
          <div className="h-12 w-72 max-w-full rounded bg-[#122425]/8" />
          <div className="h-5 w-full max-w-2xl rounded bg-[#122425]/6" />
        </div>

        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-white" />
          <div className="h-72 rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4">
        <div className="w-full rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-6 text-center sm:p-8">
          <h1 className="font-serif text-2xl italic text-[#122425] sm:text-3xl">
            Unable to load event
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#122425]/50">
            {eventError ?? "The selected event could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334]"
          >
            Back to ticket types
          </button>
        </div>
      </div>
    );
  }

  const minimumSaleStart = toDateTimeLocalValue(new Date());

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* HEADER */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() =>
            navigate(`/admin/tickets?eventId=${encodeURIComponent(eventId)}`)
          }
          className="group mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/45 transition hover:text-[#122425]"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.5}
          />
          Back to ticket types
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
              Ticket management
            </p>

            <h1 className="font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
              Create ticket type
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#122425]/50">
              Configure pricing, inventory and the sale window for this event.
            </p>
          </div>

          <div
            className={[
              "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5",
              getEventStatusClasses(event.status),
            ].join(" ")}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">
              {getEventStatusLabel(event.status)}
            </span>
          </div>
        </div>
      </div>

      {/* EVENT CONTEXT */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
        <div className="flex items-start gap-4 px-5 py-5 sm:px-7">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f5f1e9] text-[#c99b55]">
            <CalendarDays className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#c99b55]">
              Event
            </p>

            <h2 className="mt-1 truncate font-serif text-xl italic text-[#122425]">
              {event.title}
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#122425]/45">
              {formatEventDateRange(event.startDate, event.endDate)}
            </p>

            <p className="mt-1 text-xs text-[#122425]/40">
              {event.venue} · {event.city}
            </p>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {(validationError || error) && (
        <section className="mb-6 rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a84b45]/10 text-[#a84b45]">
              <span className="text-sm font-semibold">!</span>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#8f3f39]">
                Unable to create ticket type
              </p>

              <p className="mt-1 text-sm leading-6 text-[#a84b45]/75">
                {validationError ?? error}
              </p>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* BASIC INFORMATION */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
          <SectionHeader
            icon={Ticket}
            eyebrow="Ticket details"
            title="Basic information"
            description="Define how this ticket type will appear to attendees."
          />

          <div className="space-y-6 p-5 sm:p-7">
            <div>
              <label htmlFor="ticket-name" className={labelClassName}>
                Ticket name
              </label>

              <input
                id="ticket-name"
                type="text"
                value={form.name}
                onChange={(inputEvent) =>
                  updateField("name", inputEvent.target.value)
                }
                placeholder="e.g. General Admission"
                maxLength={100}
                className={inputClassName}
                disabled={isLoading}
              />

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Choose a clear name attendees will understand.
              </p>
            </div>

            <div>
              <label htmlFor="ticket-description" className={labelClassName}>
                Description
              </label>

              <textarea
                id="ticket-description"
                value={form.description}
                onChange={(inputEvent) =>
                  updateField("description", inputEvent.target.value)
                }
                placeholder="Describe what this ticket includes..."
                rows={5}
                maxLength={1000}
                className={textareaClassName}
                disabled={isLoading}
              />

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Optional. Keep the description useful and concise.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING + INVENTORY */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
          <SectionHeader
            icon={CircleDollarSign}
            eyebrow="Commercial setup"
            title="Pricing & inventory"
            description="Set the ticket price and the maximum number of tickets available."
          />

          <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 md:grid-cols-2">
            <div>
              <label htmlFor="ticket-price" className={labelClassName}>
                Price · ZMW
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#122425]/40">
                  MWK
                </span>

                <input
                  id="ticket-price"
                  type="text"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(inputEvent) =>
                    updateField("price", inputEvent.target.value)
                  }
                  placeholder="0.00"
                  className={`${inputClassName} pl-14`}
                  disabled={isLoading}
                />
              </div>

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Enter the ticket price to a maximum of two decimal places.
              </p>
            </div>

            <div>
              <label htmlFor="ticket-capacity" className={labelClassName}>
                Capacity
              </label>

              <div className="relative">
                <Users
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#122425]/30"
                  strokeWidth={1.5}
                />

                <input
                  id="ticket-capacity"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={form.capacity}
                  onChange={(inputEvent) =>
                    updateField("capacity", inputEvent.target.value)
                  }
                  placeholder="100"
                  className={`${inputClassName} pl-11`}
                  disabled={isLoading}
                />
              </div>

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Maximum number of tickets that can be sold.
              </p>
            </div>
          </div>
        </section>

        {/* SALE WINDOW */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
          <SectionHeader
            icon={Clock3}
            eyebrow="Availability"
            title="Sale window"
            description="Optionally control when attendees can purchase this ticket type."
          />

          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="sale-start" className={labelClassName}>
                  Sale starts
                </label>

                <input
                  id="sale-start"
                  type="datetime-local"
                  value={form.saleStartAt}
                  min={minimumSaleStart}
                  onChange={(inputEvent) =>
                    updateField("saleStartAt", inputEvent.target.value)
                  }
                  className={inputClassName}
                  disabled={isLoading}
                />

                <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                  Leave empty to make the ticket immediately available.
                </p>
              </div>

              <div>
                <label htmlFor="sale-end" className={labelClassName}>
                  Sale ends
                </label>

                <input
                  id="sale-end"
                  type="datetime-local"
                  min={form.saleStartAt || minimumSaleStart}
                  value={form.saleEndAt}
                  onChange={(inputEvent) =>
                    updateField("saleEndAt", inputEvent.target.value)
                  }
                  className={inputClassName}
                  disabled={isLoading}
                />

                <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                  Leave empty if there is no fixed sale end.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#c99b55]/20 bg-[#c99b55]/6 px-4 py-3.5">
              <Clock3
                className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                strokeWidth={1.5}
              />

              <p className="text-[11px] leading-5 text-[#806238]">
                Ticket lifecycle is managed separately. New ticket types are
                created as active according to the current backend contract.
              </p>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() =>
              navigate(`/admin/tickets?eventId=${encodeURIComponent(eventId)}`)
            }
            disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#122425]/10 bg-white px-5 text-xs font-semibold text-[#122425]/65 transition hover:border-[#122425]/20 hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#122425] px-6 text-xs font-semibold text-[#f3eee5] shadow-sm transition hover:bg-[#1b3334] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save className="h-4 w-4" strokeWidth={1.6} />

            {isLoading ? "Creating ticket type..." : "Create ticket type"}
          </button>
        </div>
      </form>
    </div>
  );
}
