import { Check, Eye, Trash2, X } from "lucide-react";

import type { ApplicationStatus } from "./ApplicationStatusBadge";

interface ApplicationActionsMenuProps {
  id: string;
  status: ApplicationStatus;
  onView: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

const iconButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-30";

export default function ApplicationActionsMenu({
  id,
  status,
  onView,
  onApprove,
  onReject,
  onDelete,
}: ApplicationActionsMenuProps) {
  const isPending = status === "PENDING";

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        title="View details"
        onClick={() => onView(id)}
        className={`${iconButtonBase} border-[#122425]/10 text-[#122425]/55 hover:bg-[#f5f1e9] hover:text-[#122425]`}
      >
        <Eye className="h-4 w-4" strokeWidth={1.6} />
      </button>

      {isPending && (
        <button
          type="button"
          title="Approve"
          onClick={() => onApprove(id)}
          className={`${iconButtonBase} border-[#2f6b4f]/20 text-[#2f6b4f] hover:bg-[#2f6b4f]/8`}
        >
          <Check className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}

      {isPending && (
        <button
          type="button"
          title="Reject"
          onClick={() => onReject(id)}
          className={`${iconButtonBase} border-[#a84b45]/20 text-[#a84b45] hover:bg-[#a84b45]/8`}
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}

      <button
        type="button"
        title="Delete"
        onClick={() => onDelete(id)}
        className={`${iconButtonBase} border-[#122425]/10 text-[#122425]/35 hover:border-[#a84b45]/20 hover:text-[#a84b45]`}
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
      </button>
    </div>
  );
}
