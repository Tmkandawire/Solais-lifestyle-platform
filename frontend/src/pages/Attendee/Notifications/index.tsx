import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../api/notification.api";

import type {
  NotificationItem,
  NotificationListResponse,
} from "../../../types/notification";

const PAGE_SIZE = 10;

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationLabel(type: NotificationItem["type"]): string {
  const labels: Record<NotificationItem["type"], string> = {
    ORDER: "Order",
    PAYMENT: "Payment",
    TICKET: "Ticket",
    EVENT: "Event",
    VENDOR_APPLICATION: "Vendor application",
    PARTNER_APPLICATION: "Partner application",
    SYSTEM: "System",
  };

  return labels[type];
}

export default function AttendeeNotificationsPage() {
  const [result, setResult] = useState<NotificationListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(
          {
            page,
            limit: PAGE_SIZE,
            unreadOnly,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setResult(data);
          setError(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your notifications. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchNotifications();

    return () => controller.abort();
  }, [page, unreadOnly, reloadKey]);

  const refresh = () => {
    setLoading(true);
    setReloadKey((current) => current + 1);
  };

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.readAt || busyId) return;

    setBusyId(notification.id);

    try {
      await markNotificationAsRead(notification.id);

      setResult((current) => {
        if (!current) return current;

        const updated = current.notifications.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        );

        return {
          ...current,
          notifications: unreadOnly
            ? updated.filter((item) => !item.readAt)
            : updated,
          total: unreadOnly ? Math.max(0, current.total - 1) : current.total,
          unreadCount: Math.max(0, current.unreadCount - 1),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark this notification as read.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!result?.unreadCount || markingAll) return;

    setMarkingAll(true);
    setError(null);

    try {
      await markAllNotificationsAsRead();

      if (unreadOnly) {
        setResult((current) =>
          current
            ? {
                ...current,
                notifications: [],
                total: 0,
                unreadCount: 0,
                totalPages: 0,
                page: 1,
              }
            : current,
        );
        setPage(1);
      } else {
        const now = new Date().toISOString();

        setResult((current) =>
          current
            ? {
                ...current,
                notifications: current.notifications.map((item) =>
                  item.readAt ? item : { ...item, readAt: now },
                ),
                unreadCount: 0,
              }
            : current,
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark all notifications as read.",
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;

    const notification = result?.notifications.find((item) => item.id === id);
    if (!notification) return;

    setDeletingId(id);
    setError(null);

    try {
      await deleteNotification(id);

      setResult((current) => {
        if (!current) return current;

        const remaining = current.notifications.filter(
          (item) => item.id !== id,
        );

        return {
          ...current,
          notifications: remaining,
          total: Math.max(0, current.total - 1),
          unreadCount: notification.readAt
            ? current.unreadCount
            : Math.max(0, current.unreadCount - 1),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this notification.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const notifications = result?.notifications ?? [];
  const totalPages = result?.totalPages ?? 0;
  const unreadCount = result?.unreadCount ?? 0;

  return (
    <div className="space-y-8 text-[var(--attendee-text)] sm:space-y-10">
      {/* Editorial page heading */}
      <header className="relative overflow-hidden bg-[#122425] px-6 py-9 text-[#f5f1e9] sm:px-10 sm:py-12 lg:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#c99b55]/20 sm:h-80 sm:w-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-2 -top-10 h-48 w-48 rounded-full border border-[#c99b55]/15 sm:h-64 sm:w-64"
        />

        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c99b55]">
              Member account / Your inbox
            </p>

            <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              A little note
              <br />
              <span className="italic text-[#d8c5a1]">from Solaís.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#f5f1e9]/65 sm:text-base">
              The latest updates on your experiences, bookings, tickets, and
              account — all in one place.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t border-white/15 pt-5 sm:min-w-[170px] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#c99b55]/40 text-[#c99b55]">
              <Bell size={21} strokeWidth={1.4} />
            </div>

            <div>
              <p className="font-serif text-3xl">
                {unreadCount > 99 ? "99+" : unreadCount}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#f5f1e9]/60">
                Unread updates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Inbox controls */}
      <section>
        <div className="flex flex-col gap-5 border-b border-[var(--attendee-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9b7740]">
              Your inbox
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Notifications
            </h2>
            <p className="mt-2 text-sm text-[var(--attendee-text-muted)]">
              {result
                ? `${result.total} ${unreadOnly ? "unread " : ""}notification${result.total === 1 ? "" : "s"}`
                : "Your latest updates and reminders"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh notifications"
              className="inline-flex h-10 items-center justify-center gap-2 border border-[var(--attendee-border)] px-4 text-xs font-medium text-[var(--attendee-text)] transition hover:border-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              disabled={markingAll || unreadCount === 0}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#122425] px-4 text-xs font-medium text-[#f5f1e9] transition hover:bg-[#203c3d] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {markingAll ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={14} />
              )}
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--attendee-border)]">
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setLoading(true);
                setUnreadOnly(false);
              }}
              className={`relative py-4 text-xs transition ${
                !unreadOnly
                  ? "font-semibold text-[var(--attendee-text)]"
                  : "text-[var(--attendee-text-muted)] hover:text-[var(--attendee-text)]"
              }`}
            >
              All updates
              {!unreadOnly && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#c99b55]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setPage(1);
                setLoading(true);
                setUnreadOnly(true);
              }}
              className={`relative flex items-center gap-2 py-4 text-xs transition ${
                unreadOnly
                  ? "font-semibold text-[var(--attendee-text)]"
                  : "text-[var(--attendee-text-muted)] hover:text-[var(--attendee-text)]"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#e8ddc9] px-1.5 py-0.5 text-[10px] font-semibold text-[#72572f]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {unreadOnly && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#c99b55]" />
              )}
            </button>
          </div>

          <span className="hidden text-[10px] uppercase tracking-[0.18em] text-[var(--attendee-text-muted)] sm:block">
            Personal updates
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mt-5 flex flex-col gap-3 border border-red-900/15 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex w-fit items-center gap-2 font-medium underline underline-offset-4"
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        )}

        {/* Notification list */}
        <div className="mt-2">
          {loading ? (
            <div className="divide-y divide-[var(--attendee-border)]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex gap-4 py-6 sm:gap-5 sm:py-8">
                  <div className="h-12 w-12 shrink-0 animate-pulse bg-[var(--attendee-surface-muted)]" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="h-3 w-1/3 animate-pulse bg-[var(--attendee-surface-muted)]" />
                    <div className="h-3 w-4/5 animate-pulse bg-[var(--attendee-surface-muted)]" />
                    <div className="h-3 w-1/4 animate-pulse bg-[var(--attendee-surface-muted)]" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center border-b border-[var(--attendee-border)] px-6 py-16 text-center sm:py-20">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#c99b55]/40 text-[#9b7740]">
                {unreadOnly ? (
                  <CheckCheck size={25} strokeWidth={1.3} />
                ) : (
                  <Bell size={25} strokeWidth={1.3} />
                )}
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9b7740]">
                {unreadOnly ? "All caught up" : "Your inbox awaits"}
              </p>

              <h3 className="mt-3 font-serif text-2xl sm:text-3xl">
                {unreadOnly ? "Nothing left unread." : "Nothing here just yet."}
              </h3>

              <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--attendee-text-muted)]">
                {unreadOnly
                  ? "You’ve read all your updates. We’ll keep this space ready for what comes next."
                  : "When there’s news about your bookings, tickets, or account, you’ll find it here."}
              </p>

              {unreadOnly && (
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setLoading(true);
                    setUnreadOnly(false);
                  }}
                  className="mt-6 border-b border-[#c99b55] pb-1 text-xs font-medium text-[var(--attendee-text)] transition hover:text-[var(--attendee-accent)]"
                >
                  Browse all notifications
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[var(--attendee-border)]">
              {notifications.map((notification) => {
                const isUnread = !notification.readAt;

                return (
                  <article
                    key={notification.id}
                    className={`group relative flex gap-4 py-6 transition-colors sm:gap-6 sm:py-7 ${
                      isUnread
                        ? "bg-[var(--attendee-surface-muted)]"
                        : "hover:bg-[var(--attendee-surface-muted)]/50"
                    }`}
                  >
                    {isUnread && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-0.5 bg-[#c99b55]"
                      />
                    )}

                    <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--attendee-border)] bg-[var(--attendee-surface)] text-[var(--attendee-accent)] transition-colors group-hover:border-[var(--attendee-accent)] sm:ml-4 sm:h-12 sm:w-12">
                      <Bell size={19} strokeWidth={1.35} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <h3
                          className={`font-serif text-lg leading-snug sm:text-xl ${
                            isUnread
                              ? "text-[var(--attendee-text)]"
                              : "text-[var(--attendee-text-muted)]"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        {isUnread && (
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.17em] text-[#94703a]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#c99b55]" />
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-6 text-[var(--attendee-text-muted)]">
                        {notification.message}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-[var(--attendee-text-muted)]">
                        <span>{getNotificationLabel(notification.type)}</span>
                        <span aria-hidden="true" className="text-[#c99b55]">
                          /
                        </span>
                        <time dateTime={notification.createdAt}>
                          {formatNotificationDate(notification.createdAt)}
                        </time>
                      </div>

                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--attendee-accent)] transition hover:text-[var(--attendee-text)]"
                        >
                          View details
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-2 pr-2 sm:pr-4">
                      {isUnread && (
                        <button
                          type="button"
                          aria-label={`Mark ${notification.title} as read`}
                          title="Mark as read"
                          onClick={() => void handleMarkRead(notification)}
                          disabled={busyId !== null}
                          className="flex h-9 w-9 items-center justify-center text-[var(--attendee-text-muted)] transition hover:bg-[var(--attendee-surface-muted)] hover:text-[var(--attendee-text)] disabled:opacity-40"
                        >
                          {busyId === notification.id ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Check size={17} strokeWidth={1.5} />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        aria-label={`Delete ${notification.title}`}
                        title="Delete notification"
                        onClick={() => void handleDelete(notification.id)}
                        disabled={deletingId !== null}
                        className="flex h-9 w-9 items-center justify-center text-[var(--attendee-text-muted)] transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                      >
                        {deletingId === notification.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} strokeWidth={1.4} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col gap-4 border-t border-[var(--attendee-border)] py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--attendee-text-muted)]">
              Page{" "}
              <span className="font-semibold text-[var(--attendee-text)]">
                {page}
              </span>{" "}
              of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((current) => Math.max(1, current - 1));
                }}
                disabled={page <= 1}
                className="inline-flex h-10 items-center gap-2 border border-[var(--attendee-border)] px-4 text-xs text-[var(--attendee-text)] transition hover:border-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setPage((current) => Math.min(totalPages, current + 1));
                }}
                disabled={page >= totalPages}
                className="inline-flex h-10 items-center gap-2 border border-[var(--attendee-border)] px-4 text-xs text-[var(--attendee-text)] transition hover:border-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
