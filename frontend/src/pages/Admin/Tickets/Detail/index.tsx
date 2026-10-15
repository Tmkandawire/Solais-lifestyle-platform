import { useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Pencil,
  Ticket,
  Users,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  useActivateTicketType,
  useAdminTicket,
  useDeactivateTicketType,
  useDeleteTicketType,
} from "../../../../hooks/useAdminTicket";
import { useToast } from "../../../../hooks/useToast";

import TicketTypeConfirmationModal from "../../../../components/admin/TicketTypeConfirmationModal";

import type { TicketStatus, TicketType } from "../../../../types/ticket";

const CURRENCY = "ZMW";

function formatCurrency(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatShortDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: TicketStatus) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function getStatusClasses(status: TicketStatus) {
  return status === "ACTIVE"
    ? "border-[#2f6b4f]/20 bg-[#2f6b4f]/8 text-[#2f6b4f]"
    : "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/55";
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Ticket;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
        <Icon className="h-4 w-4 text-[#c99b55]" strokeWidth={1.5} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#122425]/40">
          {label}
        </p>

        <div className="mt-1 wrap-break-word text-sm leading-6 text-[#122425]">
          {children}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#122425]/8 bg-white p-5 shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
      <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#122425]/40">
        {label}
      </p>

      <p className="mt-2 wrap-break-word font-serif text-2xl italic text-[#122425] sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-[#122425]/40">
        {description}
      </p>
    </div>
  );
}

export default function AdminTicketTypeDetailPage() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const { ticketType, isLoading, error, refresh } = useAdminTicket(id);

  const toast = useToast();

  const { activate, isLoading: isActivating } = useActivateTicketType();

  const { deactivate, isLoading: isDeactivating } = useDeactivateTicketType();

  const { remove, isLoading: isDeleting } = useDeleteTicketType();

  const [confirmation, setConfirmation] = useState<{
    ticketType: TicketType;
    action: "activate" | "deactivate" | "delete";
  } | null>(null);

  function handleActivate() {
    if (!ticketType) {
      return;
    }

    setConfirmation({
      ticketType,
      action: "activate",
    });
  }

  function handleDeactivate() {
    if (!ticketType) {
      return;
    }

    setConfirmation({
      ticketType,
      action: "deactivate",
    });
  }

  function handleDelete() {
    if (!ticketType) {
      return;
    }

    setConfirmation({
      ticketType,
      action: "delete",
    });
  }

  async function handleConfirmation() {
    if (!confirmation) {
      return;
    }

    try {
      if (confirmation.action === "activate") {
        await activate(confirmation.ticketType.id);

        toast.success("Ticket type activated.", {
          description: `${confirmation.ticketType.name} is now active.`,
        });
      } else if (confirmation.action === "deactivate") {
        await deactivate(confirmation.ticketType.id);

        toast.success("Ticket type deactivated.", {
          description: `${confirmation.ticketType.name} is no longer active.`,
        });
      } else {
        await remove(confirmation.ticketType.id);

        toast.success("Ticket type deleted successfully.", {
          description: `${confirmation.ticketType.name} has been removed from the active catalogue.`,
        });

        setConfirmation(null);

        navigate(
          `/admin/tickets?eventId=${encodeURIComponent(
            confirmation.ticketType.eventId,
          )}`,
        );

        return;
      }

      setConfirmation(null);

      await refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  if (!id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Ticket
            className="mx-auto h-10 w-10 text-[#c99b55]"
            strokeWidth={1.5}
          />

          <h1 className="mt-5 font-serif text-3xl italic text-[#122425]">
            Ticket type not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#122425]/50">
            No ticket type identifier was provided.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334]"
          >
            Return to ticket types
          </button>
        </div>
      </div>
    );
  }

  if (isLoading && !ticketType) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="h-4 w-32 rounded bg-[#122425]/8" />

        <div className="h-12 w-80 max-w-full rounded bg-[#122425]/8" />

        <div className="h-5 w-full max-w-2xl rounded bg-[#122425]/6" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-white" />
          ))}
        </div>

        <div className="h-96 rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !ticketType) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#a84b45]/10 text-[#a84b45]">
            <Ticket className="h-5 w-5" strokeWidth={1.5} />
          </div>

          <h1 className="mt-4 font-serif text-2xl italic text-[#122425] sm:text-3xl">
            Unable to load ticket type
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#122425]/50">
            {error ?? "The requested ticket type could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/tickets")}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334]"
          >
            Return to ticket types
          </button>
        </div>
      </div>
    );
  }

  const availableQuantity = Math.max(
    0,
    ticketType.capacity - ticketType.soldQuantity,
  );

  const soldPercentage =
    ticketType.capacity > 0
      ? Math.min(100, (ticketType.soldQuantity / ticketType.capacity) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* HEADER */}
      <div>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/tickets?eventId=${encodeURIComponent(
                ticketType.eventId,
              )}`,
            )
          }
          className="group mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/45 transition hover:text-[#122425]"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.5}
          />
          Back to ticket types
        </button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                Ticket management
              </p>

              <span
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1.5",
                  "text-[9px] font-semibold uppercase tracking-[0.18em]",
                  getStatusClasses(ticketType.status),
                ].join(" ")}
              >
                {getStatusLabel(ticketType.status)}
              </span>
            </div>

            <h1 className="wrap-break-word font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
              {ticketType.name}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#122425]/50">
              Review pricing, inventory and sale-window details for this ticket
              type.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/tickets/${ticketType.id}/edit?eventId=${encodeURIComponent(
                  ticketType.eventId,
                )}`,
              )
            }
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334] sm:w-auto"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.6} />
            Edit ticket type
          </button>
        </div>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Price"
          value={formatCurrency(ticketType.price)}
          description="Current ticket price"
        />

        <MetricCard
          label="Capacity"
          value={ticketType.capacity.toLocaleString("en-ZM")}
          description="Maximum tickets"
        />

        <MetricCard
          label="Sold"
          value={ticketType.soldQuantity.toLocaleString("en-ZM")}
          description={`${soldPercentage.toFixed(0)}% of capacity`}
        />

        <MetricCard
          label="Available"
          value={availableQuantity.toLocaleString("en-ZM")}
          description="Tickets remaining"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        {/* DETAILS */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
          <div className="border-b border-[#122425]/8 px-5 py-5 sm:px-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
              Configuration
            </p>

            <h2 className="mt-1 font-serif text-2xl italic text-[#122425]">
              Ticket details
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-7 p-5 sm:p-7 md:grid-cols-2">
            <DetailItem icon={Ticket} label="Ticket type">
              {ticketType.name}
            </DetailItem>

            <DetailItem icon={CircleDollarSign} label="Price">
              {formatCurrency(ticketType.price)}
            </DetailItem>

            <DetailItem icon={Users} label="Capacity">
              {ticketType.capacity.toLocaleString("en-ZM")}
            </DetailItem>

            <DetailItem icon={Users} label="Tickets sold">
              {ticketType.soldQuantity.toLocaleString("en-ZM")}
            </DetailItem>

            <DetailItem icon={Users} label="Tickets available">
              {availableQuantity.toLocaleString("en-ZM")}
            </DetailItem>

            <DetailItem icon={CalendarDays} label="Created">
              {formatDate(ticketType.createdAt)}
            </DetailItem>

            <DetailItem icon={Clock3} label="Sale starts">
              {formatDate(ticketType.saleStartAt)}
            </DetailItem>

            <DetailItem icon={Clock3} label="Sale ends">
              {formatDate(ticketType.saleEndAt)}
            </DetailItem>
          </div>

          {/* DESCRIPTION */}
          <div className="border-t border-[#122425]/8 px-5 py-5 sm:px-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#122425]/40">
              Description
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#122425]/65">
              {ticketType.description?.trim() ||
                "No description has been provided for this ticket type."}
            </p>
          </div>
        </section>

        {/* INVENTORY */}
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
            <div className="border-b border-[#122425]/8 px-5 py-5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
                Inventory
              </p>

              <h2 className="mt-1 font-serif text-2xl italic text-[#122425]">
                Sales progress
              </h2>
            </div>

            <div className="p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-serif text-4xl italic text-[#122425]">
                    {soldPercentage.toFixed(0)}%
                  </p>

                  <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#122425]/40">
                    Capacity sold
                  </p>
                </div>

                <p className="text-right text-xs text-[#122425]/45">
                  {ticketType.soldQuantity.toLocaleString("en-ZM")} /{" "}
                  {ticketType.capacity.toLocaleString("en-ZM")}
                </p>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#122425]/8">
                <div
                  className="h-full rounded-full bg-[#c99b55] transition-all"
                  style={{
                    width: `${soldPercentage}%`,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#f5f1e9] p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/40">
                    Sold
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#122425]">
                    {ticketType.soldQuantity.toLocaleString("en-ZM")}
                  </p>
                </div>

                <div className="rounded-xl bg-[#f5f1e9] p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/40">
                    Remaining
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#122425]">
                    {availableQuantity.toLocaleString("en-ZM")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SALE WINDOW */}
          <section className="rounded-2xl border border-[#122425]/8 bg-white p-5 shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
              Availability
            </p>

            <h2 className="mt-1 font-serif text-2xl italic text-[#122425]">
              Sale window
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/40">
                  Starts
                </p>

                <p className="mt-1 text-sm text-[#122425]">
                  {formatDate(ticketType.saleStartAt)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/40">
                  Ends
                </p>

                <p className="mt-1 text-sm text-[#122425]">
                  {formatDate(ticketType.saleEndAt)}
                </p>
              </div>
            </div>
          </section>

          {/* RECORD */}
          <section className="rounded-2xl border border-[#122425]/8 bg-white p-5 shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
              Record
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#122425]/40">Created</span>

                <span className="text-right text-xs font-medium text-[#122425]/70">
                  {formatShortDate(ticketType.createdAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[#122425]/40">Updated</span>

                <span className="text-right text-xs font-medium text-[#122425]/70">
                  {formatShortDate(ticketType.updatedAt)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/tickets?eventId=${encodeURIComponent(
                ticketType.eventId,
              )}`,
            )
          }
          className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#122425]/10 bg-white px-5 text-xs font-semibold text-[#122425]/65 transition hover:border-[#122425]/20 hover:text-[#122425] sm:w-auto"
        >
          Back to ticket types
        </button>

        {ticketType.deletedAt === null && (
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#a84b45]/20 bg-[#a84b45]/5 px-6 text-xs font-semibold text-[#a84b45] transition hover:bg-[#a84b45]/10 sm:w-auto"
          >
            Delete ticket type
          </button>
        )}

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {ticketType.status === "INACTIVE" &&
            ticketType.deletedAt === null && (
              <button
                type="button"
                onClick={handleActivate}
                className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full border border-[#2f6b4f]/20 bg-[#2f6b4f]/8 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2f6b4f] transition hover:bg-[#2f6b4f]/12 sm:w-auto"
              >
                Activate
              </button>
            )}

          {ticketType.status === "ACTIVE" && ticketType.deletedAt === null && (
            <button
              type="button"
              onClick={handleDeactivate}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-full border border-[#122425]/12 bg-white px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/70 transition hover:bg-[#f5f1e9] sm:w-auto"
            >
              Deactivate
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admin/tickets/${ticketType.id}/edit?eventId=${encodeURIComponent(
                  ticketType.eventId,
                )}`,
              )
            }
            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-[#122425] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334] sm:w-auto"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.6} />
            Edit ticket type
          </button>
        </div>
      </div>

      <TicketTypeConfirmationModal
        ticketType={confirmation?.ticketType ?? null}
        action={confirmation?.action ?? "activate"}
        isOpen={confirmation !== null}
        isLoading={isActivating || isDeactivating || isDeleting}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmation}
      />
    </div>
  );
}
