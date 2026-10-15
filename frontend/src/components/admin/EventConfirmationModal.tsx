import {
  CalendarDays,
  MapPin,
  X,
  AlertCircle,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import type { AdminEvent } from "../../types/event";

interface EventConfirmationModalProps {
  event: AdminEvent | null;
  action: "cancel" | "delete" | "complete";
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function EventConfirmationModal({
  event,
  action,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: EventConfirmationModalProps) {
  if (!isOpen || !event) {
    return null;
  }

  const isDelete = action === "delete";
  const isComplete = action === "complete";

  const title = isDelete
    ? "Delete this event?"
    : isComplete
      ? "Mark this event as completed?"
      : "Cancel this event?";

  const description = isDelete
    ? "This will remove the event from your administration catalogue. This action cannot be undone."
    : isComplete
      ? "This will change the event’s status to Completed. Attendees will be notified of the completion."
      : "This will change the event’s status to Cancelled. Attendees will no longer be able to book, and the event will be removed from public listings.";

  const confirmLabel = isDelete
    ? "DELETE EVENT"
    : isComplete
      ? "MARK AS COMPLETED"
      : "CANCEL EVENT";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071415]/60 px-4 py-6 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-confirmation-title"
        aria-describedby="event-confirmation-description"
        className="relative w-full max-w-[550px] overflow-hidden rounded-[20px] border border-[#e7e0d5] bg-[#faf8f3] shadow-[0_24px_80px_rgba(7,20,21,0.25)]"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close confirmation"
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dfd4] bg-[#faf8f3] text-[#263535] transition hover:bg-[#f0ebe2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <div className="px-7 pb-7 pt-10 sm:px-8 sm:pb-8 sm:pt-12">
          {/* Icon */}
          <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#f3e6d4]">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#c9822b] text-[#c9822b]">
              {isDelete ? (
                <Trash2 size={20} strokeWidth={1.7} />
              ) : isComplete ? (
                <CheckCircle2 size={22} strokeWidth={1.7} />
              ) : (
                <AlertCircle size={22} strokeWidth={1.7} />
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="mt-6 text-center">
            <h2
              id="event-confirmation-title"
              className="font-serif text-[34px] leading-tight tracking-[-0.02em] text-[#122425] sm:text-[38px]"
            >
              {title}
            </h2>

            <p
              id="event-confirmation-description"
              className="mx-auto mt-3 max-w-[440px] text-[14px] leading-6 text-[#69706e]"
            >
              {description}
            </p>
          </div>

          {/* Event summary */}
          <div className="mt-7 rounded-[15px] border border-[#e8e1d7] bg-white/70 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#e6dfd4] bg-[#f1ece3]">
                {event.bannerImageUrl ? (
                  <img
                    src={event.bannerImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CalendarDays
                    size={24}
                    strokeWidth={1.5}
                    className="text-[#8b806f]"
                  />
                )}
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="truncate text-[15px] font-semibold text-[#122425]">
                  {event.title}
                </p>

                <p className="mt-1 text-[13px] text-[#737976]">
                  {formatEventDate(event.startDate)}{" "}
                  <span className="mx-1">·</span>{" "}
                  {formatEventTime(event.startDate)} –{" "}
                  {formatEventTime(event.endDate)}
                </p>

                <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[#737976]">
                  <MapPin size={13} strokeWidth={1.7} />
                  <span className="truncate">
                    {event.venue}, {event.city}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-[46px] rounded-full border border-[#dcd5ca] bg-transparent px-5 text-[12px] font-semibold tracking-[0.14em] text-[#183032] transition hover:bg-[#f0ebe2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              KEEP EVENT
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="h-[46px] rounded-full bg-[#b6534d] px-5 text-[12px] font-semibold tracking-[0.14em] text-white transition hover:bg-[#9f4843] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? isDelete
                  ? "DELETING..."
                  : isComplete
                    ? "MARKING AS COMPLETED..."
                    : "CANCELLING..."
                : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
