import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#07191a]/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-description"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#c9a96a]/20 bg-[#122425] p-8 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close logout confirmation"
          className="absolute right-5 top-5 rounded-full p-2 text-[#eee8dd]/60 transition hover:bg-white/5 hover:text-[#eee8dd]"
        >
          <X size={18} strokeWidth={1.5} />
        </button>

        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-[#c9a96a]/25 bg-[#c9a96a]/8">
          <LogOut size={20} strokeWidth={1.5} className="text-[#c99b55]" />
        </div>

        {/* Content */}
        <div className="pr-8">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
            Account
          </p>

          <h2
            id="logout-modal-title"
            className="font-serif text-3xl leading-tight text-[#f5f1e9]"
          >
            Log out of your account?
          </h2>

          <p
            id="logout-modal-description"
            className="mt-4 text-sm leading-6 text-[#eee8dd]/65"
          >
            You will need to sign in again to access your SOLAÍS member area.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#eee8dd]/15 px-5 py-3 text-sm text-[#eee8dd]/80 transition hover:border-[#eee8dd]/25 hover:bg-white/5 hover:text-[#f5f1e9]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-[#eee5d7] px-5 py-3 text-sm font-medium text-[#122425] transition hover:bg-[#f5f1e9]"
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
