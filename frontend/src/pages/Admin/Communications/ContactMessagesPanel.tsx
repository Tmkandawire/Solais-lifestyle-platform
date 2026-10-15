import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Mail,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { apiClient } from "../../../api/client";

type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactListResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ApiEnvelope<T> = { data: T };

const statusLabels: Record<ContactStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

const statusStyles: Record<ContactStatus, string> = {
  NEW: "bg-amber-50 text-amber-800",
  IN_PROGRESS: "bg-blue-50 text-blue-800",
  RESOLVED: "bg-emerald-50 text-emerald-800",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return "Something went wrong. Please try again.";
}

export default function ContactMessagesPanel() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<"ALL" | ContactStatus>(
    "ALL",
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadMessages = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      setError(null);

      try {
        const response = await apiClient.get<ApiEnvelope<ContactListResponse>>(
          "/contact-messages/manage",
          {
            params: {
              page,
              limit: 10,
              ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
              ...(search ? { search } : {}),
            },
          },
        );

        const result = response.data.data;
        setMessages(result.messages);
        setTotal(result.total);
        setTotalPages(result.totalPages);

        setSelectedMessage((current) => {
          if (!current) return null;
          return (
            result.messages.find((message) => message.id === current.id) ?? null
          );
        });
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, statusFilter],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadMessages]);

  function applySearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function updateStatus(message: ContactMessage, status: ContactStatus) {
    setBusyId(message.id);
    setError(null);
    setNotice(null);

    try {
      await apiClient.patch(`/contact-messages/manage/${message.id}/status`, {
        status,
      });

      setNotice(`Message marked as ${statusLabels[status].toLowerCase()}.`);
      await loadMessages(true);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  }

  function deleteMessage(message: ContactMessage) {
    setDeleteTarget(message);
  }

  async function confirmDeleteMessage() {
    if (!deleteTarget) return;

    const message = deleteTarget;

    setBusyId(message.id);
    setError(null);
    setNotice(null);

    try {
      await apiClient.delete(`/contact-messages/manage/${message.id}`);

      setSelectedMessage((current) =>
        current?.id === message.id ? null : current,
      );

      setDeleteTarget(null);
      setNotice("Contact message deleted successfully.");

      await loadMessages(true);
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-white">
      <div className="flex flex-col gap-4 border-b border-[#122425]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-serif text-2xl italic text-[#122425]">
            Contact messages
          </h2>
          <p className="mt-1 text-xs text-[#746f65]">
            Review enquiries submitted through the public website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadMessages(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#122425]/15 px-4 py-3 text-xs font-semibold text-[#122425] hover:bg-[#f5f1e9] disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 border-b border-[#122425]/10 p-5 sm:grid-cols-2 sm:p-6">
        <div className="rounded-xl bg-[#f8f5ef] p-4">
          <p className="text-xs text-[#746f65]">Matching enquiries</p>
          <p className="mt-2 font-serif text-3xl text-[#122425]">{total}</p>
        </div>

        <div className="rounded-xl bg-[#f8f5ef] p-4">
          <p className="text-xs text-[#746f65]">Current status filter</p>
          <p className="mt-2 font-serif text-2xl text-[#122425]">
            {statusFilter === "ALL"
              ? "All statuses"
              : statusLabels[statusFilter]}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-[#122425]/10 p-5 sm:p-6 lg:flex-row">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            applySearch();
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#938b7e]"
            />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, email or subject..."
              maxLength={200}
              className="w-full rounded-xl border border-[#122425]/15 py-3 pl-9 pr-3 text-sm outline-none focus:border-[#b18443]"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-[#122425] px-4 text-xs font-semibold text-white hover:bg-[#203839]"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "ALL" | ContactStatus);
            setPage(1);
          }}
          aria-label="Filter contact messages by status"
          className="rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#b18443]"
        >
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {notice && (
        <div
          role="status"
          className="bg-emerald-50 px-5 py-3 text-sm text-emerald-900"
        >
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-2 bg-red-50 px-5 py-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadMessages(true)}
            className="self-start font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-[#746f65]">
          <LoaderCircle size={20} className="animate-spin" />
          Loading contact messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
          <Mail size={30} className="text-[#b18443]" strokeWidth={1.5} />
          <h3 className="mt-4 font-serif text-2xl italic text-[#122425]">
            No enquiries found
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#746f65]">
            Try changing your search or status filter. New website enquiries
            will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#122425]/10">
          {messages.map((message) => {
            const busy = busyId === message.id;

            return (
              <article
                key={message.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee5d7] text-[#72552c]">
                  <Mail size={18} />
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(message)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[message.status]}`}
                    >
                      {statusLabels[message.status]}
                    </span>
                    <span className="text-[11px] text-[#938b7e]">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-[#122425]">
                    {message.subject}
                  </h3>
                  <p className="mt-1 text-sm text-[#746f65]">
                    {message.fullName} · {message.email}
                  </p>
                  <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-[#746f65]">
                    {message.message}
                  </p>
                  <span className="mt-3 inline-flex text-xs font-semibold text-[#8b682f] underline underline-offset-4">
                    View message
                  </span>
                </button>

                <div className="flex shrink-0 items-center gap-2">
                  {message.status !== "RESOLVED" && (
                    <button
                      type="button"
                      title="Mark as resolved"
                      aria-label={`Resolve message from ${message.fullName}`}
                      disabled={busy}
                      onClick={() => void updateStatus(message, "RESOLVED")}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#122425]/10 text-emerald-800 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      {busy ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    title="Delete message"
                    aria-label={`Delete message from ${message.fullName}`}
                    disabled={busy}
                    onClick={() => void deleteMessage(message)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#122425]/10 text-[#8c5149] hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-[#122425]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[#746f65]">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex items-center gap-1 rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex items-center gap-1 rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-semibold disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#122425]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedMessage(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-message-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#fbf8f4] shadow-2xl"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#122425]/10 p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b18443]">
                  Contact enquiry
                </p>
                <h2
                  id="contact-message-title"
                  className="mt-2 font-serif text-2xl italic text-[#122425]"
                >
                  {selectedMessage.subject}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close message details"
                onClick={() => setSelectedMessage(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#122425]/10 hover:bg-white"
              >
                <X size={17} />
              </button>
            </header>

            <div className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-[#938b7e]">From</p>
                  <p className="mt-1 text-sm font-semibold text-[#122425]">
                    {selectedMessage.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#938b7e]">Submitted</p>
                  <p className="mt-1 text-sm text-[#122425]">
                    {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#938b7e]">Email address</p>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="mt-1 block break-all text-sm text-[#8b682f] underline underline-offset-4"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <p className="text-xs text-[#938b7e]">Phone number</p>
                  {selectedMessage.phone ? (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="mt-1 block text-sm text-[#8b682f] underline underline-offset-4"
                    >
                      {selectedMessage.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-[#746f65]">Not provided</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#938b7e]">
                  Message
                </p>
                <p className="mt-3 whitespace-pre-wrap break-word text-sm leading-7 text-[#122425]">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label
                  htmlFor="contact-message-status"
                  className="text-xs font-semibold uppercase tracking-wider text-[#938b7e]"
                >
                  Enquiry status
                </label>

                <select
                  id="contact-message-status"
                  value={selectedMessage.status}
                  disabled={busyId === selectedMessage.id}
                  onChange={(event) => {
                    void updateStatus(
                      selectedMessage,
                      event.target.value as ContactStatus,
                    );
                  }}
                  className="mt-2 w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#b18443] disabled:opacity-50"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#122425]/10 pt-5">
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(`Re: ${selectedMessage.subject}`)}`}
                  className="inline-flex items-center justify-center rounded-full bg-[#122425] px-5 py-3 text-xs font-semibold text-white hover:bg-[#203839]"
                >
                  Reply by email
                </a>

                <button
                  type="button"
                  disabled={busyId === selectedMessage.id}
                  onClick={() => void deleteMessage(selectedMessage)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-900/20 px-5 py-3 text-xs font-semibold text-red-800 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Delete enquiry
                </button>
              </div>
            </div>

            {deleteTarget && (
              <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071415]/60 px-4 py-6 backdrop-blur-[3px]"
                role="presentation"
                onMouseDown={(event) => {
                  if (
                    event.target === event.currentTarget &&
                    busyId !== deleteTarget.id
                  ) {
                    setDeleteTarget(null);
                  }
                }}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="delete-contact-title"
                  aria-describedby="delete-contact-description"
                  className="relative w-full max-w-[520px] overflow-hidden rounded-[20px] border border-[#e7e0d5] bg-[#faf8f3] shadow-[0_24px_80px_rgba(7,20,21,0.25)]"
                >
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={busyId === deleteTarget.id}
                    aria-label="Close confirmation"
                    className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-[#e6dfd4] text-[#263535] transition hover:bg-[#f0ebe2] disabled:opacity-50"
                  >
                    <X size={18} strokeWidth={1.8} />
                  </button>

                  <div className="px-6 pb-7 pt-10 sm:px-8 sm:pt-12">
                    <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#f3e6d4]">
                      <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-[#b6534d] text-[#a14c43]">
                        <AlertCircle size={22} strokeWidth={1.7} />
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#a68a50]">
                        SOLAÍS Administration
                      </p>

                      <h2
                        id="delete-contact-title"
                        className="mt-3 font-serif text-3xl leading-tight tracking-[-0.02em] text-[#122425] sm:text-[36px]"
                      >
                        Delete this message?
                      </h2>

                      <p
                        id="delete-contact-description"
                        className="mx-auto mt-3 max-w-[410px] text-sm leading-6 text-[#69706e]"
                      >
                        This will permanently delete the contact enquiry from
                        your administration records. This action cannot be
                        undone.
                      </p>
                    </div>

                    <div className="mt-7 rounded-[15px] border border-[#e8e1d7] bg-white/70 p-4">
                      <p className="break-words text-sm font-semibold text-[#122425]">
                        {deleteTarget.subject}
                      </p>

                      <p className="mt-1 text-xs text-[#69706e]">
                        {deleteTarget.fullName}
                      </p>

                      <p className="mt-1 break-all text-xs text-[#8b682f]">
                        {deleteTarget.email}
                      </p>

                      <p className="mt-3 max-h-32 overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[#69706e]">
                        {deleteTarget.message}
                      </p>

                      <p className="mt-3 flex items-center gap-1.5 text-xs text-[#a14c43]">
                        <AlertCircle size={13} />
                        Please confirm before proceeding.
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(null)}
                        disabled={busyId === deleteTarget.id}
                        className="h-[46px] rounded-full border border-[#dcd5ca] px-5 text-xs font-semibold tracking-[0.12em] text-[#183032] transition hover:bg-[#f0ebe2] disabled:opacity-50"
                      >
                        GO BACK
                      </button>

                      <button
                        type="button"
                        onClick={() => void confirmDeleteMessage()}
                        disabled={busyId === deleteTarget.id}
                        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full bg-[#b6534d] px-5 text-xs font-semibold tracking-[0.12em] text-white transition hover:bg-[#9f4843] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busyId === deleteTarget.id ? (
                          <>
                            <LoaderCircle size={15} className="animate-spin" />
                            DELETING...
                          </>
                        ) : (
                          "DELETE MESSAGE"
                        )}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
