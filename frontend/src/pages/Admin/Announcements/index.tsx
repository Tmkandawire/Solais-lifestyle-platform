import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  BellRing,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  LoaderCircle,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
  CheckCircle2,
} from "lucide-react";
import { apiClient } from "../../../api/client";

type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface Announcement {
  id: string;
  title: string;
  message: string;
  status: AnnouncementStatus;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: unknown[];
}

type StatusFilter = "ALL" | AnnouncementStatus;

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown): string {
  const response = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return (
    response.response?.data?.message ??
    "Something went wrong. Please try again."
  );
}

function formatDate(value: string | null): string {
  if (!value) return "Not published";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClasses(status: AnnouncementStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-800";
    case "DRAFT":
      return "bg-amber-100 text-amber-800";
    case "ARCHIVED":
      return "bg-stone-200 text-stone-600";
  }
}

export default function AdminAnnouncementsPage() {
  const [result, setResult] = useState<AnnouncementListResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    announcement: Announcement;
    action: "publish" | "archive" | "delete";
  } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiClient.get<
        ApiResponse<AnnouncementListResponse>
      >("/announcements/manage", {
        params: {
          page,
          limit: PAGE_SIZE,
          ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
          ...(search ? { search } : {}),
        },
      });

      setResult(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      try {
        const response = await apiClient.get<
          ApiResponse<AnnouncementListResponse>
        >("/announcements/manage", {
          params: {
            page,
            limit: PAGE_SIZE,
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            ...(search ? { search } : {}),
          },
        });

        if (!cancelled) {
          setResult(response.data.data);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchAnnouncements();

    return () => {
      cancelled = true;
    };
  }, [page, statusFilter, search]);

  function startCreate() {
    setEditing(null);
    setTitle("");
    setMessage("");
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  function startEdit(announcement: Announcement) {
    if (announcement.status === "ARCHIVED") return;

    setEditing(announcement);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setError("");
    setNotice("");
    setFormOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      setError("Enter both an announcement title and message.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editing) {
        await apiClient.patch(`/announcements/${editing.id}`, {
          title: cleanTitle,
          message: cleanMessage,
        });
        setNotice("Announcement updated successfully.");
      } else {
        await apiClient.post("/announcements", {
          title: cleanTitle,
          message: cleanMessage,
        });
        setNotice("Announcement saved as a draft.");
      }

      setFormOpen(false);
      setEditing(null);
      setTitle("");
      setMessage("");
      setPage(1);

      // Refresh immediately using the current page and filters.
      await loadAnnouncements();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  function performAction(
    announcement: Announcement,
    action: "publish" | "archive" | "delete",
  ) {
    setConfirmation({ announcement, action });
  }

  async function confirmAnnouncementAction() {
    if (!confirmation) return;

    const { announcement, action } = confirmation;

    setActionId(announcement.id);
    setError("");
    setNotice("");

    try {
      if (action === "publish") {
        await apiClient.patch(`/announcements/${announcement.id}/publish`);
        setNotice("Announcement published successfully.");
      } else if (action === "archive") {
        await apiClient.patch(`/announcements/${announcement.id}/archive`);
        setNotice("Announcement archived successfully.");
      } else {
        await apiClient.delete(`/announcements/${announcement.id}`);
        setNotice("Announcement deleted successfully.");
      }

      setConfirmation(null);
      await loadAnnouncements();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionId(null);
    }
  }

  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const announcements = result?.announcements ?? [];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b48643]">
            Communications
          </p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight text-[#122425] sm:text-5xl">
            Announcements
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#66706d]">
            Publish important updates and information for SOLAÍS attendees.
            Drafts remain private until published.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#122425] px-6 py-3.5 text-xs font-semibold text-[#eee8dd] transition hover:bg-[#203a3b]"
        >
          <Plus size={17} />
          New announcement
        </button>
      </header>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <Check size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{notice}</p>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="flex-1">{error}</p>
          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <X size={17} />
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="All announcements"
          value={result?.total ?? "—"}
          icon={Megaphone}
        />
        <StatCard
          label="Current filter"
          value={statusFilter === "ALL" ? "All statuses" : statusFilter}
          icon={Clock3}
        />
        <StatCard
          label="Current page"
          value={
            result ? `${result.page} of ${Math.max(result.totalPages, 1)}` : "—"
          }
          icon={BellRing}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-white">
        <div className="space-y-4 border-b border-[#122425]/10 p-5 sm:p-6">
          <form
            onSubmit={applySearch}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a8e86]"
              />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search titles and messages..."
                className="w-full rounded-xl border border-[#122425]/15 bg-[#f9f7f2] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#b48643]"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#122425] px-5 py-3 text-xs font-semibold text-white transition hover:bg-[#203a3b]"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => void loadAnnouncements()}
              disabled={loading}
              aria-label="Refresh announcements"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#122425]/15 px-4 py-3 text-xs font-semibold transition hover:bg-[#f5f1e9] disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {(["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setPage(1);
                  }}
                  className={[
                    "rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition",
                    statusFilter === status
                      ? "bg-[#122425] text-[#eee8dd]"
                      : "border border-[#122425]/15 text-[#66706d] hover:bg-[#f5f1e9]",
                  ].join(" ")}
                >
                  {status === "ALL" ? "All statuses" : status}
                </button>
              ),
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#66706d]">
            <LoaderCircle size={20} className="animate-spin" />
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f1e9] text-[#b48643]">
              <Megaphone size={24} strokeWidth={1.4} />
            </div>
            <h2 className="mt-5 font-serif text-2xl text-[#122425]">
              No announcements found
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#66706d]">
              Try another filter or search term, or create a new announcement.
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#122425]/15 px-5 py-3 text-xs font-semibold transition hover:bg-[#f5f1e9]"
            >
              <Plus size={16} />
              Create announcement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#122425]/10">
            {announcements.map((announcement) => {
              const busy = actionId === announcement.id;

              return (
                <article
                  key={announcement.id}
                  className="p-5 transition hover:bg-[#fcfbf8] sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.13em] ${statusClasses(announcement.status)}`}
                        >
                          {announcement.status}
                        </span>
                        <span className="text-[10px] text-[#8a8e86]">
                          Created {formatDate(announcement.createdAt)}
                        </span>
                      </div>

                      <h2 className="mt-3 font-serif text-2xl text-[#122425]">
                        {announcement.title}
                      </h2>

                      <p className="mt-2 max-w-3xl whitespace-pre-wrap wrap-break-word text-sm leading-7 text-[#66706d]">
                        {announcement.message}
                      </p>

                      <p className="mt-4 text-[10px] uppercase tracking-[0.12em] text-[#8a8e86]">
                        {announcement.status === "PUBLISHED"
                          ? `Published ${formatDate(announcement.publishedAt)}`
                          : announcement.status === "ARCHIVED"
                            ? `Archived ${formatDate(announcement.archivedAt)}`
                            : "Not visible to attendees"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 xl:max-w-64 xl:justify-end">
                      {announcement.status !== "ARCHIVED" && (
                        <ActionButton
                          label="Edit"
                          icon={Pencil}
                          disabled={busy}
                          onClick={() => startEdit(announcement)}
                        />
                      )}

                      {announcement.status === "DRAFT" && (
                        <ActionButton
                          label="Publish"
                          icon={Send}
                          disabled={busy}
                          onClick={() =>
                            void performAction(announcement, "publish")
                          }
                        />
                      )}

                      {announcement.status === "PUBLISHED" && (
                        <ActionButton
                          label="Archive"
                          icon={Archive}
                          disabled={busy}
                          onClick={() =>
                            void performAction(announcement, "archive")
                          }
                        />
                      )}

                      <ActionButton
                        label="Delete"
                        icon={Trash2}
                        disabled={busy}
                        destructive
                        onClick={() =>
                          void performAction(announcement, "delete")
                        }
                      />

                      {busy && (
                        <LoaderCircle
                          size={17}
                          className="animate-spin self-center text-[#8a8e86]"
                        />
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-[#122425]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-[#66706d]">
              Page {result.page} of {result.totalPages} · {result.total}{" "}
              announcements
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-[#122425]/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>
              <button
                type="button"
                disabled={page >= result.totalPages || loading}
                onClick={() =>
                  setPage((current) => Math.min(result.totalPages, current + 1))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#122425]/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#090f0f]/65 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setFormOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-form-title"
            className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#c9a96a]/20 bg-[#f5f1e9] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 bg-[#122425] px-6 py-6 text-[#eee8dd] sm:px-8">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                  Communications
                </p>
                <h2
                  id="announcement-form-title"
                  className="mt-2 font-serif text-3xl"
                >
                  {editing ? "Edit announcement" : "New announcement"}
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#eee8dd]/65">
                  {editing
                    ? "Update the announcement content."
                    : "Your announcement will remain a draft until you publish it."}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                disabled={saving}
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-white/20 p-2 transition hover:bg-white/10 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {error}
                </p>
              )}

              <div>
                <label
                  htmlFor="announcement-title"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d5b59]"
                >
                  Announcement title
                </label>
                <input
                  id="announcement-title"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Upcoming event update"
                  className="w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#b48643]"
                />
                <p className="mt-1 text-right text-[10px] text-[#8a8e86]">
                  {title.length}/200
                </p>
              </div>

              <div>
                <label
                  htmlFor="announcement-message"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4d5b59]"
                >
                  Message
                </label>
                <textarea
                  id="announcement-message"
                  required
                  maxLength={5000}
                  rows={8}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write the announcement for SOLAÍS attendees..."
                  className="w-full resize-y rounded-xl border border-[#122425]/15 bg-white px-4 py-3.5 text-sm leading-7 text-[#122425] outline-none transition focus:border-[#b48643]"
                />
                <p className="mt-1 text-right text-[10px] text-[#8a8e86]">
                  {message.length}/5000
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#122425]/10 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setFormOpen(false)}
                  className="rounded-full border border-[#122425]/15 px-6 py-3 text-xs font-semibold text-[#122425] transition hover:bg-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !message.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#122425] px-6 py-3 text-xs font-semibold text-[#eee8dd] transition hover:bg-[#203a3b] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {editing ? "Save changes" : "Save as draft"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {confirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071415]/60 px-4 py-6 backdrop-blur-[3px]"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              actionId !== confirmation.announcement.id
            ) {
              setConfirmation(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-confirmation-title"
            aria-describedby="announcement-confirmation-description"
            className="relative w-full max-w-[520px] overflow-hidden rounded-[20px] border border-[#e7e0d5] bg-[#faf8f3] shadow-[0_24px_80px_rgba(7,20,21,0.25)]"
          >
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              disabled={actionId === confirmation.announcement.id}
              aria-label="Close confirmation"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dfd4] text-[#263535] transition hover:bg-[#f0ebe2] disabled:opacity-50"
            >
              <X size={18} strokeWidth={1.8} />
            </button>

            <div className="px-6 pb-7 pt-10 sm:px-8 sm:pt-12">
              <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f3e6d4]">
                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#c9822b] text-[#a66c27]">
                  {confirmation.action === "publish" ? (
                    <CheckCircle2 size={22} strokeWidth={1.7} />
                  ) : confirmation.action === "archive" ? (
                    <Archive size={21} strokeWidth={1.7} />
                  ) : (
                    <Trash2 size={20} strokeWidth={1.7} />
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
                  SOLAÍS Administration
                </p>

                <h2
                  id="announcement-confirmation-title"
                  className="mt-3 font-serif text-3xl leading-tight tracking-[-0.02em] text-[#122425] sm:text-[36px]"
                >
                  {confirmation.action === "publish"
                    ? "Publish announcement?"
                    : confirmation.action === "archive"
                      ? "Archive announcement?"
                      : "Delete announcement?"}
                </h2>

                <p
                  id="announcement-confirmation-description"
                  className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#69706e]"
                >
                  {confirmation.action === "publish"
                    ? "This announcement will become visible to attendees."
                    : confirmation.action === "archive"
                      ? "This announcement will be archived and no longer available in the published feed."
                      : "This will permanently delete the announcement. This action cannot be undone."}
                </p>
              </div>

              <div className="mt-7 rounded-[15px] border border-[#e8e1d7] bg-white/70 p-4">
                <p className="break-words text-sm font-semibold text-[#122425]">
                  {confirmation.announcement.title}
                </p>
                <p className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[#69706e]">
                  {confirmation.announcement.message}
                </p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#a68a50]">
                  Current status: {confirmation.announcement.status}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setConfirmation(null)}
                  disabled={actionId === confirmation.announcement.id}
                  className="h-[46px] rounded-full border border-[#dcd5ca] px-5 text-xs font-semibold tracking-[0.12em] text-[#183032] transition hover:bg-[#f0ebe2] disabled:opacity-50"
                >
                  GO BACK
                </button>

                <button
                  type="button"
                  onClick={() => void confirmAnnouncementAction()}
                  disabled={actionId === confirmation.announcement.id}
                  className={`h-[46px] rounded-full px-5 text-xs font-semibold tracking-[0.12em] text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirmation.action === "delete"
                      ? "bg-[#b6534d] hover:bg-[#9f4843]"
                      : "bg-[#122425] hover:bg-[#1f3234]"
                  }`}
                >
                  {actionId === confirmation.announcement.id ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <LoaderCircle size={15} className="animate-spin" />
                      PROCESSING...
                    </span>
                  ) : confirmation.action === "publish" ? (
                    "PUBLISH"
                  ) : confirmation.action === "archive" ? (
                    "ARCHIVE"
                  ) : (
                    "DELETE"
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Megaphone;
}) {
  return (
    <div className="rounded-2xl border border-[#d8cdbd] bg-[#ebe4d8] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4d5b59]">
          {label}
        </p>
        <Icon size={19} strokeWidth={1.5} className="text-[#b48643]" />
      </div>
      <p className="mt-5 font-serif text-3xl text-[#122425]">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  disabled,
  destructive = false,
  onClick,
}: {
  label: string;
  icon: typeof Pencil;
  disabled: boolean;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-1.5 rounded-full border px-3.5 py-2.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40",
        destructive
          ? "border-red-200 text-red-700 hover:bg-red-50"
          : "border-[#122425]/15 text-[#122425] hover:bg-[#f5f1e9]",
      ].join(" ")}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
