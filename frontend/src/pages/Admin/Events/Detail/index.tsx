import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Send,
  Ticket,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  useAdminEvent,
  useCancelEvent,
  useCompleteEvent,
  useDeleteEvent,
  usePublishEvent,
} from "../../../../hooks/useAdminEvent";
import { useToast } from "../../../../hooks/useToast";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${formatDate(startDate)}`;
  }

  return `${formatDate(startDate)} — ${formatDate(endDate)}`;
}

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    DRAFT: "border-[#c99b55]/25 bg-[#c99b55]/8 text-[#9b702f]",
    PUBLISHED: "border-emerald-700/15 bg-emerald-700/8 text-emerald-700",
    CANCELLED: "border-red-700/15 bg-red-700/8 text-red-700",
    COMPLETED: "border-[#122425]/15 bg-[#122425]/6 text-[#122425]",
  };

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1.5",
        "text-[9px] font-semibold uppercase tracking-[0.18em]",
        classes[status] ??
          "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/60",
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
        <Icon className="h-4 w-4 text-[#c99b55]" strokeWidth={1.5} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#122425]/40">
          {label}
        </p>

        <div className="mt-1 text-sm text-[#122425]">{children}</div>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = "secondary",
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const variants = {
    primary: "bg-[#122425] text-[#eee8dd] hover:bg-[#1b3334]",
    secondary:
      "border border-[#122425]/10 bg-white text-[#122425] hover:bg-[#f5f1e9]",
    danger: "border border-red-700/15 bg-white text-red-700 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5",
        "text-[10px] font-semibold uppercase tracking-[0.16em]",
        "transition disabled:cursor-not-allowed disabled:opacity-40",
        variants[variant],
      ].join(" ")}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      {label}
    </button>
  );
}

export default function AdminEventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const { event, isLoading, error, refresh } = useAdminEvent(id);

  const { publish, isLoading: isPublishing } = usePublishEvent();

  const { cancel, isLoading: isCancelling } = useCancelEvent();

  const { complete, isLoading: isCompleting } = useCompleteEvent();

  const { remove, isLoading: isDeleting } = useDeleteEvent();

  const isMutating = isPublishing || isCancelling || isCompleting || isDeleting;

  async function handlePublish() {
    if (!event) return;

    try {
      await publish(event.id);

      toast.success("Event published successfully.", {
        description: "The event is now available to attendees.",
      });

      refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  async function handleComplete() {
    if (!event) return;

    const confirmed = window.confirm(
      "Mark this event as completed? This action changes the event lifecycle status.",
    );

    if (!confirmed) return;

    try {
      await complete(event.id);

      toast.success("Event marked as completed.");

      refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  async function handleCancel() {
    if (!event) return;

    const confirmed = window.confirm(
      "Cancel this event? Attendees should no longer be able to treat it as an active published event.",
    );

    if (!confirmed) return;

    try {
      await cancel(event.id);

      toast.success("Event cancelled.");

      refresh();
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  async function handleDelete() {
    if (!event) return;

    const confirmed = window.confirm(
      "Delete this event? The event will be removed from the active administration catalogue.",
    );

    if (!confirmed) return;

    try {
      await remove(event.id);

      toast.success("Event deleted successfully.", {
        description: "The event has been removed from the active catalogue.",
      });

      navigate("/admin/events");
    } catch {
      // Mutation hook exposes the error state.
    }
  }

  if (isLoading && !event) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-28 rounded bg-[#122425]/8" />
          <div className="h-10 w-72 rounded bg-[#122425]/8" />
          <div className="h-5 w-96 max-w-full rounded bg-[#122425]/6" />

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="h-96 rounded-[1.75rem] bg-white" />
            <div className="h-96 rounded-[1.75rem] bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/admin/events")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#122425]/50 transition hover:text-[#122425]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </button>

        <section className="rounded-[1.75rem] border border-red-700/15 bg-white p-8 sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-700/70">
            Event unavailable
          </p>

          <h1 className="mt-3 font-serif text-4xl italic text-[#122425]">
            We couldn't load this event.
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#122425]/55">
            {error ?? "The requested event could not be found."}
          </p>

          <button
            type="button"
            onClick={refresh}
            className="mt-7 inline-flex h-11 items-center rounded-full bg-[#122425] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#eee8dd] transition hover:bg-[#1b3334]"
          >
            Try again
          </button>
        </section>
      </div>
    );
  }

  const canEdit = event.status === "DRAFT" || event.status === "PUBLISHED";

  const canPublish = event.status === "DRAFT";

  const canComplete = event.status === "PUBLISHED";

  const canCancel = event.status === "DRAFT" || event.status === "PUBLISHED";

  const canDelete =
    event.status === "DRAFT" ||
    event.status === "PUBLISHED" ||
    event.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Back navigation */}
      <button
        type="button"
        onClick={() => navigate("/admin/events")}
        className="inline-flex items-center gap-2 text-sm text-[#122425]/50 transition hover:text-[#122425]"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to events
      </button>

      {/* Hero */}
      <section className="overflow-hidden rounded-[1.75rem] border border-[#122425]/8 bg-white">
        <div className="p-7 sm:p-9 lg:p-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
                  Event management
                </p>

                <StatusBadge status={event.status} />
              </div>

              <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] text-[#122425] sm:text-5xl">
                {event.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#122425]/55">
                {event.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {canEdit && (
                <ActionButton
                  icon={Pencil}
                  label="Edit"
                  disabled={isMutating}
                  onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                />
              )}

              {canPublish && (
                <ActionButton
                  icon={Send}
                  label={isPublishing ? "Publishing..." : "Publish"}
                  disabled={isMutating}
                  variant="primary"
                  onClick={handlePublish}
                />
              )}

              {canComplete && (
                <ActionButton
                  icon={CheckCircle2}
                  label={isCompleting ? "Completing..." : "Complete"}
                  disabled={isMutating}
                  variant="primary"
                  onClick={handleComplete}
                />
              )}
            </div>
          </div>
        </div>

        {event.bannerImageUrl && (
          <div className="border-t border-[#122425]/8 bg-[#f5f1e9]">
            <img
              src={event.bannerImageUrl}
              alt={event.title}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        )}
      </section>

      {/* Main information */}
      <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Event information */}
        <section className="rounded-[1.75rem] border border-[#122425]/8 bg-white p-7 sm:p-9">
          <div className="border-b border-[#122425]/8 pb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
              Event details
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#122425]">
              The experience
            </h2>
          </div>

          <div className="grid gap-7 py-7 sm:grid-cols-2">
            <DetailItem icon={MapPin} label="Location">
              <p>{event.venue}</p>
              <p className="mt-1 text-[#122425]/45">{event.city}</p>
            </DetailItem>

            <DetailItem icon={CalendarDays} label="Dates">
              <p>{formatDateRange(event.startDate, event.endDate)}</p>
            </DetailItem>

            <DetailItem icon={Clock3} label="Schedule">
              <p>
                {formatTime(event.startDate)} — {formatTime(event.endDate)}
              </p>
            </DetailItem>

            <DetailItem icon={Users} label="Capacity">
              <p>
                {event.capacity === null
                  ? "Unlimited"
                  : `${event.capacity.toLocaleString()} attendees`}
              </p>
            </DetailItem>
          </div>

          <div className="border-t border-[#122425]/8 pt-7">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#122425]/35">
              Description
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#122425]/65">
              {event.description}
            </p>
          </div>
        </section>

        {/* Event management */}
        <section className="rounded-[1.75rem] bg-[#122425] p-7 text-[#eee8dd] sm:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Event management
          </p>

          <h2 className="mt-2 font-serif text-3xl italic">
            Manage this experience.
          </h2>

          <div className="mt-8 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Current status
              </p>

              <div className="mt-3">
                <StatusBadge status={event.status} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Ticket types
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06]">
                  <Ticket
                    className="h-4 w-4 text-[#c99b55]"
                    strokeWidth={1.5}
                  />
                </div>

                <p className="text-sm text-white/65">
                  No ticket types configured yet.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
              Event ID
            </p>

            <p className="mt-2 break-all font-mono text-xs text-white/45">
              {event.id}
            </p>
          </div>
        </section>
      </div>

      {/* Ticket preparation */}
      <section className="rounded-[1.75rem] border border-[#122425]/8 bg-white p-7 sm:p-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
              Ticketing
            </p>

            <h2 className="mt-2 font-serif text-3xl text-[#122425]">
              Ticket types
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/50">
              Ticket configuration will be managed from this event once the
              ticketing workflow is connected.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#122425]/10 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/35"
          >
            <Ticket className="h-4 w-4" strokeWidth={1.5} />
            Add ticket type
          </button>
        </div>
      </section>

      {/* Danger zone */}
      {(canCancel || canDelete) && (
        <section className="rounded-[1.75rem] border border-red-700/10 bg-white p-7 sm:p-9">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-red-700/60">
            Event controls
          </p>

          <h2 className="mt-2 font-serif text-3xl text-[#122425]">
            Lifecycle actions
          </h2>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {canCancel && (
              <ActionButton
                icon={XCircle}
                label={isCancelling ? "Cancelling..." : "Cancel event"}
                disabled={isMutating}
                variant="danger"
                onClick={handleCancel}
              />
            )}

            {canDelete && (
              <ActionButton
                icon={Trash2}
                label={isDeleting ? "Deleting..." : "Delete event"}
                disabled={isMutating}
                variant="danger"
                onClick={handleDelete}
              />
            )}
          </div>
        </section>
      )}
    </div>
  );
}
