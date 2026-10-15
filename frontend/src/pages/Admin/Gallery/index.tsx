import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  ImagePlus,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  createGalleryItem,
  deleteGalleryItem,
  getAdminGalleryItems,
  publishGalleryItem,
  unpublishGalleryItem,
  updateGalleryItem,
  uploadGalleryMedia,
} from "../../../api/gallery.api";
import { getAdminEvents } from "../../../api/event.api";
import { Field, StatusBadge } from "../../../components/admin/AdminDisplay";
import GalleryConfirmationModal, {
  type GalleryAction,
} from "../../../components/admin/GalleryConfirmationModal";
import type { AdminEvent } from "../../../types/event";
import type { GalleryItem, MediaType } from "../../../types/gallery";

const PAGE_SIZE = 12;

const inputClass =
  "w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm text-[#122425] outline-none focus:border-[#c9a96a]";

const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#122425] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#eee8dd] transition hover:bg-[#1f3234] disabled:cursor-not-allowed disabled:opacity-50";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function PublicationBadge({ published }: { published: boolean }) {
  return (
    <StatusBadge
      className={
        published
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }
    >
      {published ? "Published" : "Draft"}
    </StatusBadge>
  );
}

function GalleryForm({
  events,
  item,
  saving,
  onClose,
  onSave,
}: {
  events: AdminEvent[];
  item: GalleryItem | null;
  saving: boolean;
  onClose: () => void;
  onSave: (values: {
    title: string;
    description: string;
    eventId: string;
    displayOrder: number;
    file: File | null;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [eventId, setEventId] = useState(item?.eventId ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    String(item?.displayOrder ?? 0),
  );

  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const order = Number(displayOrder);

    if (!Number.isSafeInteger(order) || order < 0) {
      setFormError("Display order must be a non-negative whole number.");
      return;
    }

    if (!item && !file) {
      setFormError("Choose an image or video to upload.");
      return;
    }

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        eventId,
        displayOrder: order,
        file,
      });
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#080b0b]/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-form-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#122425]/10 bg-[#f8f6f0] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#122425]/10 px-5 py-5 sm:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
              SOLAÍS Administration
            </p>
            <h2
              id="gallery-form-title"
              className="mt-2 font-serif text-3xl text-[#122425]"
            >
              {item ? "Edit gallery item" : "Add to gallery"}
            </h2>
            <p className="mt-2 text-sm text-[#5f6663]">
              {item
                ? "Update the item's details."
                : "Upload media and add it to your gallery as a draft."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
            className="rounded-full p-2 text-[#122425]/70 hover:bg-[#122425]/5 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-8">
          <div>
            <label className="mb-2 block text-xs font-semibold text-[#122425]">
              Title *
            </label>
            <input
              className={inputClass}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={160}
              required
              autoFocus
              placeholder="Give this gallery item a title"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#122425]">
              Description
            </label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Add a description (optional)"
            />
          </div>

          {!item && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[#122425]">
                Image or video {!item && "*"}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="rounded-xl border border-dashed border-[#c9a96a] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#122425]">
                      {file?.name ?? "No file selected"}
                    </p>
                    <p className="mt-1 text-xs text-[#737a76]">
                      JPEG, PNG, WEBP, MP4, WEBM or MOV · Maximum 50 MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#122425] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#234142]"
                  >
                    <Upload size={15} />
                    {file ? "Change file" : "Choose file"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {item && (
            <div className="rounded-xl border border-[#122425]/10 bg-white p-4">
              <p className="text-xs font-semibold text-[#122425]">
                Existing media
              </p>
              <p className="mt-1 break-all text-xs text-[#5f6663]">
                {item.mediaType} · {item.publicId}
              </p>
              <p className="mt-2 text-xs text-[#5f6663]">
                Media replacement is not available in this edit form.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#122425]">
              Associated event
            </label>
            <select
              className={inputClass}
              value={eventId}
              onChange={(event) => setEventId(event.target.value)}
            >
              <option value="">No event association</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-[#122425]">
              Display order
            </label>
            <input
              className={inputClass}
              type="number"
              min={0}
              step={1}
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              required
            />
            <p className="mt-2 text-xs text-[#5f6663]">
              Lower numbers appear first.
            </p>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {formError}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#122425]/10 pt-5">
            <button
              type="button"
              className="rounded-full border border-[#122425]/15 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#122425] disabled:opacity-50"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={buttonClass} disabled={saving}>
              {saving ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {saving ? "Saving…" : item ? "Save changes" : "Upload item"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [page, setPage] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType | "">("");
  const [publication, setPublication] = useState<"" | "published" | "draft">(
    "",
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formItem, setFormItem] = useState<GalleryItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmationItem, setConfirmationItem] = useState<GalleryItem | null>(
    null,
  );

  const [confirmationAction, setConfirmationAction] =
    useState<GalleryAction>("publish");

  const refetch = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next !== search) {
        setSearch(next);
        setPage(1);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput, search]);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      try {
        const result = await getAdminEvents({ page: 1, limit: 100 });
        if (!cancelled) setEvents(result.events);
      } catch {
        if (!cancelled) setEvents([]);
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      try {
        setLoading(true);
        setError(null);

        const result = await getAdminGalleryItems({
          page,
          limit: PAGE_SIZE,
          ...(mediaType ? { mediaType } : {}),
          ...(publication ? { isPublished: publication === "published" } : {}),
        });

        if (cancelled) return;

        setItems(result.galleryItems);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadGallery();

    return () => {
      cancelled = true;
    };
  }, [page, mediaType, publication, refreshToken]);

  const visibleItems = items.filter((item) => {
    const query = search.toLowerCase();
    return (
      !query ||
      item.title.toLowerCase().includes(query) ||
      (item.description ?? "").toLowerCase().includes(query)
    );
  });

  const showForm = (item: GalleryItem | null = null) => {
    setFormItem(item);
    setFormOpen(true);
    setNotice(null);
  };

  const closeForm = () => {
    if (!saving) setFormOpen(false);
  };

  async function saveItem(values: {
    title: string;
    description: string;
    eventId: string;
    displayOrder: number;
    file: File | null;
  }) {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (formItem) {
        await updateGalleryItem(formItem.id, {
          title: values.title,
          description: values.description || null,
          eventId: values.eventId || null,
          displayOrder: values.displayOrder,
        });
        setNotice("Gallery item updated successfully.");
      } else {
        if (!values.file) throw new Error("Select a media file first.");

        const uploaded = await uploadGalleryMedia(values.file);

        await createGalleryItem({
          title: values.title,
          description: values.description || null,
          mediaType: uploaded.mediaType,
          mediaUrl: uploaded.mediaUrl,
          publicId: uploaded.publicId,
          eventId: values.eventId || null,
          displayOrder: values.displayOrder,
        });

        setNotice(
          "Media uploaded and saved as a draft. Publish it when you're ready.",
        );
      }

      setFormOpen(false);
      setPage(1);
      refetch();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  function requestConfirmation(item: GalleryItem, action: GalleryAction) {
    setConfirmationItem(item);
    setConfirmationAction(action);
    setError(null);
    setNotice(null);
  }

  function closeConfirmation() {
    if (!busyId) {
      setConfirmationItem(null);
    }
  }

  async function confirmGalleryAction() {
    const item = confirmationItem;
    if (!item || busyId) return;

    const action = confirmationAction;

    setBusyId(item.id);
    setError(null);
    setNotice(null);

    try {
      if (action === "delete") {
        await deleteGalleryItem(item.id);
        setNotice("Gallery item deleted.");

        if (items.length === 1 && page > 1) {
          setPage((value) => value - 1);
        } else {
          refetch();
        }
      } else if (action === "publish") {
        await publishGalleryItem(item.id);
        setNotice("Gallery item published.");
        refetch();
      } else {
        await unpublishGalleryItem(item.id);
        setNotice("Gallery item unpublished.");
        refetch();
      }

      setConfirmationItem(null);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  }

  const effectiveTotalPages = Math.max(totalPages, 1);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c9a96a]/75">
          SOLAÍS Administration
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-5xl tracking-[-0.02em] text-[#122425] sm:text-6xl">
              Gallery
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6663]">
              Manage event photography, videos and the media displayed on the
              public gallery.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-[#122425]/15 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#122425] disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => showForm()}
              className={buttonClass}
            >
              <ImagePlus size={15} />
              Add media
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#122425]/10 bg-white/65 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5f6663]">
            Matching items
          </p>
          <p className="mt-3 font-serif text-3xl text-[#122425]">
            {total.toLocaleString("en-GB")}
          </p>
        </div>
        <div className="rounded-2xl border border-[#122425]/10 bg-white/65 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5f6663]">
            Images
          </p>
          <p className="mt-3 font-serif text-3xl text-[#122425]">
            {items.filter((item) => item.mediaType === "IMAGE").length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#122425]/10 bg-white/65 p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#5f6663]">
            Current page
          </p>
          <p className="mt-3 font-serif text-3xl text-[#122425]">
            {page}{" "}
            <span className="text-lg text-[#5f6663]">
              / {effectiveTotalPages}
            </span>
          </p>
        </div>
      </section>

      <section className="grid gap-3 rounded-2xl border border-[#122425]/10 bg-white/65 p-4 sm:grid-cols-3 sm:p-6">
        <label className="relative block sm:col-span-1">
          <span className="sr-only">Search gallery items on this page</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5f6663]"
          />
          <input
            className={`${inputClass} pl-11`}
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search this page…"
          />
        </label>

        <label>
          <span className="sr-only">Media type</span>
          <select
            className={inputClass}
            value={mediaType}
            onChange={(event) => {
              setPage(1);
              setMediaType(event.target.value as MediaType | "");
            }}
          >
            <option value="">All media types</option>
            <option value="IMAGE">Images</option>
            <option value="VIDEO">Videos</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Publication status</span>
          <select
            className={inputClass}
            value={publication}
            onChange={(event) => {
              setPage(1);
              setPublication(event.target.value as "" | "published" | "draft");
            }}
          >
            <option value="">All publication statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </label>
      </section>

      {notice && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="w-fit font-semibold underline underline-offset-4"
          >
            Try again
          </button>
        </div>
      )}

      <section aria-busy={loading}>
        {loading && items.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <div
                key={key}
                className="h-72 animate-pulse rounded-2xl bg-[#122425]/5"
              />
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-[#122425]/10 bg-white/65 px-6 py-16 text-center">
            <ImagePlus size={28} className="mx-auto text-[#a68a50]" />
            <h2 className="mt-4 font-serif text-2xl text-[#122425]">
              {search ? "No matching gallery items" : "Your gallery is empty"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#5f6663]">
              {search
                ? "Try a different search term."
                : "Upload your first image or video to start building the gallery."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={() => showForm()}
                className={`${buttonClass} mt-5`}
              >
                <ImagePlus size={14} />
                Add media
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-white/80"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#122425]/5">
                  {item.mediaType === "IMAGE" ? (
                    <img
                      src={item.thumbnailUrl || item.mediaUrl}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.mediaUrl}
                      poster={item.thumbnailUrl || undefined}
                      controls
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <StatusBadge className="border-white/50 bg-white/90 text-[#122425]">
                      {item.mediaType === "IMAGE" ? "Image" : "Video"}
                    </StatusBadge>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-serif text-xl text-[#122425]">
                        {item.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#5f6663]">
                        {item.description || "No description added."}
                      </p>
                    </div>
                    <PublicationBadge published={item.isPublished} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[#122425]/10 pt-4">
                    <Field label="Display order">{item.displayOrder}</Field>
                    <Field label="Event">
                      {events.find((event) => event.id === item.eventId)
                        ?.title ??
                        (item.eventId ? "Linked event" : "Not associated")}
                    </Field>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[#122425]/10 pt-4">
                    <button
                      type="button"
                      onClick={() => showForm(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#122425]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#122425] hover:bg-[#122425]/5"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        requestConfirmation(
                          item,
                          item.isPublished ? "unpublish" : "publish",
                        )
                      }
                      disabled={busyId === item.id}
                      className="rounded-full border border-[#c9a96a]/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#80642f] hover:bg-[#c9a96a]/10 disabled:opacity-50"
                    >
                      {busyId === item.id
                        ? "Working…"
                        : item.isPublished
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => requestConfirmation(item, "delete")}
                      disabled={busyId === item.id}
                      aria-label={`Delete ${item.title}`}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <nav
        aria-label="Gallery pagination"
        className="flex flex-wrap items-center justify-between gap-4 border-t border-[#122425]/10 pt-5"
      >
        <p className="text-xs text-[#5f6663]">
          Page {page} of {effectiveTotalPages} · {total} item(s)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-[#122425]/15 px-4 py-2 text-sm text-[#122425] disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-full border border-[#122425]/15 px-4 py-2 text-sm text-[#122425] disabled:opacity-40"
            onClick={() =>
              setPage((value) => Math.min(effectiveTotalPages, value + 1))
            }
            disabled={page >= effectiveTotalPages || loading}
          >
            Next
          </button>
        </div>
      </nav>

      {formOpen && (
        <GalleryForm
          events={events}
          item={formItem}
          saving={saving}
          onClose={closeForm}
          onSave={saveItem}
        />
      )}

      <GalleryConfirmationModal
        item={confirmationItem}
        action={confirmationAction}
        isOpen={Boolean(confirmationItem)}
        isLoading={Boolean(confirmationItem && busyId === confirmationItem.id)}
        onClose={closeConfirmation}
        onConfirm={() => void confirmGalleryAction()}
      />
    </div>
  );
}
