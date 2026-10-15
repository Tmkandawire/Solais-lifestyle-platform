import { useState } from "react";
import { Loader2 } from "lucide-react";

export type ApplicationConfirmationAction = "approve" | "reject" | "delete";

interface ApplicationConfirmationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  action: ApplicationConfirmationAction;
  entityLabel: string;
  entityName: string;
  onClose: () => void;
  onConfirm: (adminNotes?: string) => void;
}

function getCopy(action: ApplicationConfirmationAction, entityLabel: string) {
  switch (action) {
    case "approve":
      return {
        title: "Approve this application?",
        description: `This will mark the ${entityLabel} as approved. You can add an optional note for your records.`,
        confirmLabel: "Approve",
        confirmClasses: "bg-[#2f6b4f] hover:bg-[#25543e]",
        showNotes: true,
      };

    case "reject":
      return {
        title: "Reject this application?",
        description: `This will mark the ${entityLabel} as rejected. You can add an optional note explaining why.`,
        confirmLabel: "Reject",
        confirmClasses: "bg-[#a84b45] hover:bg-[#8f3f39]",
        showNotes: true,
      };

    case "delete":
    default:
      return {
        title: "Delete this application?",
        description: `This will permanently remove the ${entityLabel} from the active list. This action cannot be undone.`,
        confirmLabel: "Delete",
        confirmClasses: "bg-[#a84b45] hover:bg-[#8f3f39]",
        showNotes: false,
      };
  }
}

/**
 * Public entry point. Only mounts the stateful content below while
 * isOpen is true, so the "reset notes on open" concern is handled by
 * mount/unmount instead of a setState-in-effect — no reset effect
 * needed at all, matching the "derive instead of reset" fix already
 * agreed for EventDetailsPage.tsx / useOrder.ts.
 */
export default function ApplicationConfirmationModal(
  props: ApplicationConfirmationModalProps,
) {
  if (!props.isOpen) {
    return null;
  }

  return <ApplicationConfirmationModalContent {...props} />;
}

function ApplicationConfirmationModalContent({
  isLoading,
  action,
  entityLabel,
  entityName,
  onClose,
  onConfirm,
}: ApplicationConfirmationModalProps) {
  const [notes, setNotes] = useState("");

  const copy = getCopy(action, entityLabel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#122425]/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_30px_90px_rgba(18,36,37,0.2)] sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
          {entityName}
        </p>

        <h2 className="mt-3 font-serif text-2xl italic text-[#122425]">
          {copy.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-[#122425]/55">
          {copy.description}
        </p>

        {copy.showNotes && (
          <div className="mt-5">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#122425]/45">
              Admin note (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add context for this decision..."
              className="w-full resize-none rounded-xl border border-[#122425]/10 bg-[#f5f1e9]/55 px-4 py-3 text-sm text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/50 focus:bg-white"
            />
          </div>
        )}

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex h-10 items-center rounded-full border border-[#122425]/10 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#122425]/55 transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() =>
              onConfirm(copy.showNotes ? notes.trim() || undefined : undefined)
            }
            disabled={isLoading}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${copy.confirmClasses}`}
          >
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
            )}
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
