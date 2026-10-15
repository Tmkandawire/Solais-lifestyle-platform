import { AlertCircle, CheckCircle2, EyeOff, Trash2, X } from "lucide-react";
import type { GalleryItem } from "../../types/gallery";

export type GalleryAction = "publish" | "unpublish" | "delete";

interface GalleryConfirmationModalProps {
  item: GalleryItem | null;
  action: GalleryAction;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function GalleryConfirmationModal({
  item,
  action,
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
}: GalleryConfirmationModalProps) {
  if (!isOpen || !item) return null;

  const isDelete = action === "delete";
  const isPublish = action === "publish";

  const title = isDelete
    ? "Delete this gallery item?"
    : isPublish
      ? "Publish this gallery item?"
      : "Unpublish this gallery item?";

  const description = isDelete
    ? "This will remove the item from your gallery administration catalogue. This action cannot be undone from the admin interface."
    : isPublish
      ? "This item will become visible in the public gallery."
      : "This item will be removed from the public gallery. You can publish it again later.";

  const confirmLabel = isDelete
    ? "DELETE ITEM"
    : isPublish
      ? "PUBLISH ITEM"
      : "UNPUBLISH ITEM";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071415]/60 px-4 py-6 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-confirmation-title"
        aria-describedby="gallery-confirmation-description"
        className="relative w-full max-w-[520px] overflow-hidden rounded-[20px] border border-[#e7e0d5] bg-[#faf8f3] shadow-[0_24px_80px_rgba(7,20,21,0.25)]"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close confirmation"
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dfd4] text-[#263535] transition hover:bg-[#f0ebe2] disabled:opacity-50"
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        <div className="px-6 pb-7 pt-10 sm:px-8 sm:pt-12">
          <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f3e6d4]">
            <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#c9822b] text-[#a66c27]">
              {isDelete ? (
                <Trash2 size={20} strokeWidth={1.7} />
              ) : isPublish ? (
                <CheckCircle2 size={22} strokeWidth={1.7} />
              ) : (
                <EyeOff size={21} strokeWidth={1.7} />
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
              SOLAÍS Administration
            </p>
            <h2
              id="gallery-confirmation-title"
              className="mt-3 font-serif text-3xl leading-tight tracking-[-0.02em] text-[#122425] sm:text-[36px]"
            >
              {title}
            </h2>
            <p
              id="gallery-confirmation-description"
              className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#69706e]"
            >
              {description}
            </p>
          </div>

          <div className="mt-7 flex items-start gap-4 rounded-[15px] border border-[#e8e1d7] bg-white/70 p-4">
            <div className="h-[76px] w-[88px] shrink-0 overflow-hidden rounded-xl border border-[#e6dfd4] bg-[#f1ece3]">
              {item.mediaType === "IMAGE" ? (
                <img
                  src={item.thumbnailUrl || item.mediaUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={item.mediaUrl}
                  poster={item.thumbnailUrl || undefined}
                  preload="metadata"
                  muted
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0 pt-1">
              <p className="break-words text-sm font-semibold text-[#122425]">
                {item.title}
              </p>
              <p className="mt-1 text-xs text-[#737976]">
                {item.mediaType === "IMAGE" ? "Image" : "Video"} ·{" "}
                {item.isPublished ? "Published" : "Draft"}
              </p>
              {isDelete && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-[#a14c43]">
                  <AlertCircle size={13} />
                  Please confirm before proceeding.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-[46px] rounded-full border border-[#dcd5ca] px-5 text-xs font-semibold tracking-[0.12em] text-[#183032] transition hover:bg-[#f0ebe2] disabled:opacity-50"
            >
              GO BACK
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-[46px] rounded-full px-5 text-xs font-semibold tracking-[0.12em] text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isDelete
                  ? "bg-[#b6534d] hover:bg-[#9f4843]"
                  : "bg-[#122425] hover:bg-[#1f3234]"
              }`}
            >
              {isLoading
                ? isDelete
                  ? "DELETING..."
                  : isPublish
                    ? "PUBLISHING..."
                    : "UNPUBLISHING..."
                : confirmLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
