import {
  AlertTriangle,
  CheckCircle2,
  Power,
  PowerOff,
  Trash2,
  X,
} from "lucide-react";

import type { TicketType } from "../../types/ticket";

type TicketTypeConfirmationAction = "activate" | "deactivate" | "delete";

interface TicketTypeConfirmationModalProps {
  ticketType: TicketType | null;
  action: TicketTypeConfirmationAction;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ACTION_CONFIG = {
  activate: {
    icon: Power,
    eyebrow: "Activate ticket type",
    title: "Activate this ticket type?",
    description:
      "This ticket type will become active and can be made available for sale according to its configured sale window.",
    confirmLabel: "Activate ticket",
    iconWrapper: "border-[#2f6b4f]/15 bg-[#2f6b4f]/5 text-[#2f6b4f]",
    button: "bg-[#2f6b4f] text-white hover:bg-[#285d45]",
  },

  deactivate: {
    icon: PowerOff,
    eyebrow: "Deactivate ticket type",
    title: "Deactivate this ticket type?",
    description:
      "This ticket type will no longer be available for new purchases. Existing issued tickets are not affected.",
    confirmLabel: "Deactivate ticket",
    iconWrapper: "border-[#c99b55]/20 bg-[#c99b55]/8 text-[#8d692f]",
    button: "bg-[#122425] text-[#eee8dd] hover:bg-[#1b3435]",
  },

  delete: {
    icon: Trash2,
    eyebrow: "Delete ticket type",
    title: "Delete this ticket type?",
    description:
      "This ticket type will be removed from the active ticket catalogue. This action cannot be used if tickets have already been sold.",
    confirmLabel: "Delete ticket",
    iconWrapper: "border-red-700/15 bg-red-50 text-red-700",
    button: "bg-red-700 text-white hover:bg-red-800",
  },
} as const;

export default function TicketTypeConfirmationModal({
  ticketType,
  action,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: TicketTypeConfirmationModalProps) {
  if (!isOpen || !ticketType) {
    return null;
  }

  const config = ACTION_CONFIG[action];
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#122425]/70 px-5 backdrop-blur-sm"
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
        aria-labelledby="ticket-type-confirmation-title"
        aria-describedby="ticket-type-confirmation-description"
        className="w-full max-w-md rounded-2xl border border-[#122425]/10 bg-[#f5f1e9] p-7 shadow-2xl sm:p-8"
      >
        {/* CLOSE */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${config.iconWrapper}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.6} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close confirmation dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#122425]/35 transition hover:bg-[#122425]/5 hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-30"
          >
            <X className="h-4 w-4" strokeWidth={1.6} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            {config.eyebrow}
          </p>

          <h2
            id="ticket-type-confirmation-title"
            className="mt-2 font-serif text-3xl italic tracking-tight text-[#122425]"
          >
            {config.title}
          </h2>

          <p
            id="ticket-type-confirmation-description"
            className="mt-3 text-sm leading-6 text-[#122425]/55"
          >
            {config.description}
          </p>
        </div>

        {/* TICKET SUMMARY */}
        <div className="mt-6 rounded-xl border border-[#122425]/8 bg-white px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f5f1e9] text-[#c99b55]">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#122425]">
                {ticketType.name}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#122425]/40">
                <span>
                  {ticketType.soldQuantity.toLocaleString("en-ZM")} sold
                </span>

                <span aria-hidden="true">·</span>

                <span>
                  {ticketType.capacity.toLocaleString("en-ZM")} capacity
                </span>

                <span aria-hidden="true">·</span>

                <span>{ticketType.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DELETE WARNING */}
        {action === "delete" && ticketType.soldQuantity > 0 && (
          <div className="mt-4 flex gap-3 rounded-xl border border-red-700/15 bg-red-50 px-4 py-3.5">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-700"
              strokeWidth={1.6}
            />

            <p className="text-xs leading-5 text-red-800/75">
              This ticket type has already sold tickets and cannot be deleted.
              The delete operation will be rejected by the server.
            </p>
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#122425]/10 bg-white px-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/65 transition hover:border-[#122425]/20 hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[10px] font-semibold uppercase tracking-[0.16em] transition disabled:cursor-not-allowed disabled:opacity-50 ${config.button}`}
          >
            {isLoading ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
                {config.confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
