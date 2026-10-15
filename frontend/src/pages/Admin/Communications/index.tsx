import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { apiClient } from "../../../api/client";
import ContactMessagesPanel from "./ContactMessagesPanel";

type NotificationType =
  | "ORDER"
  | "PAYMENT"
  | "TICKET"
  | "EVENT"
  | "VENDOR_APPLICATION"
  | "PARTNER_APPLICATION"
  | "SYSTEM";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

type Filter = "all" | "unread";

const typeLabels: Record<NotificationType, string> = {
  ORDER: "Orders",
  PAYMENT: "Payments",
  TICKET: "Tickets",
  EVENT: "Events",
  VENDOR_APPLICATION: "Vendor applications",
  PARTNER_APPLICATION: "Partner applications",
  SYSTEM: "System",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getErrorMessage(error: unknown) {
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

export default function AdminCommunicationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"contact" | "notifications">(
    "contact",
  );

  const loadNotifications = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const [listResponse, countResponse] = await Promise.all([
          apiClient.get<{ data: NotificationListResponse }>("/notifications", {
            params: {
              page,
              limit: 10,
              unreadOnly: filter === "unread",
            },
          }),
          apiClient.get<{ data: { unreadCount: number } }>(
            "/notifications/unread-count",
          ),
        ]);

        const result = listResponse.data.data;

        setNotifications(result.notifications);
        setTotal(result.total);
        setUnreadCount(countResponse.data.data.unreadCount);
        setTotalPages(result.totalPages);
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, page],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    setBusyId(id);
    setError(null);
    setNotice(null);

    try {
      await apiClient.patch(`/notifications/${id}/read`);
      await loadNotifications(true);
      setNotice("Notification marked as read.");
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  };

  const markAllAsRead = async () => {
    setMarkingAll(true);
    setError(null);
    setNotice(null);

    try {
      await apiClient.patch("/notifications/read-all");
      await loadNotifications(true);
      setNotice("All notifications marked as read.");
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!window.confirm("Delete this notification? This cannot be undone.")) {
      return;
    }

    setBusyId(id);
    setError(null);
    setNotice(null);

    try {
      await apiClient.delete(`/notifications/${id}`);
      await loadNotifications(true);
      setNotice("Notification deleted.");
    } catch (actionError) {
      setError(getErrorMessage(actionError));
    } finally {
      setBusyId(null);
    }
  };

  const changeFilter = (nextFilter: Filter) => {
    setFilter(nextFilter);
    setPage(1);
    setNotice(null);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b18443]">
            Operations / Communications
          </p>

          <h1 className="mt-3 font-serif text-4xl italic text-[#122425] sm:text-5xl">
            Communications
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-[#746f65]">
            Manage contact enquiries and operational notifications for your
            administrator account, including applications, orders, payments,
            tickets, and event updates.
          </p>
        </div>

        {activeTab === "notifications" && (
          <button
            type="button"
            onClick={() => void loadNotifications(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-[#122425]/15 px-5 py-3 text-xs font-semibold text-[#122425] transition hover:bg-white disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        )}
      </header>

      {/* Communications tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#122425]/10 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("contact")}
          aria-current={activeTab === "contact" ? "page" : undefined}
          className={[
            "rounded-full px-5 py-3 text-xs font-semibold transition",
            activeTab === "contact"
              ? "bg-[#122425] text-[#eee8dd]"
              : "border border-[#122425]/15 text-[#746f65] hover:bg-white",
          ].join(" ")}
        >
          Contact Messages
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("notifications")}
          aria-current={activeTab === "notifications" ? "page" : undefined}
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition",
            activeTab === "notifications"
              ? "bg-[#122425] text-[#eee8dd]"
              : "border border-[#122425]/15 text-[#746f65] hover:bg-white",
          ].join(" ")}
        >
          Operational Notifications
          {unreadCount > 0 && (
            <span
              className={[
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                activeTab === "notifications"
                  ? "bg-[#eee8dd] text-[#122425]"
                  : "bg-[#b18443] text-white",
              ].join(" ")}
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === "contact" ? (
        <ContactMessagesPanel />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#122425]/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#746f65]">
                  Notifications in this view
                </p>
                <Bell size={19} className="text-[#b18443]" />
              </div>

              <p className="mt-4 font-serif text-4xl text-[#122425]">{total}</p>

              <p className="mt-2 text-xs text-[#938b7e]">
                {filter === "unread"
                  ? "Unread notifications matching your current view"
                  : "Total notifications matching your current view"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#122425]/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#746f65]">
                  Unread notifications
                </p>
                <Clock3 size={19} className="text-[#b18443]" />
              </div>

              <p className="mt-4 font-serif text-4xl text-[#122425]">
                {unreadCount}
              </p>

              <p className="mt-2 text-xs text-[#938b7e]">
                Across your administrator account
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[#122425]/10 bg-white">
            <div className="flex flex-col gap-4 border-b border-[#122425]/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h2 className="font-serif text-2xl italic text-[#122425]">
                  Operational inbox
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-[#746f65]">
                  Review application submissions and important updates
                  associated with your administrator account.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0 || markingAll || loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#122425] px-5 py-3 text-xs font-semibold text-[#eee8dd] transition hover:bg-[#203839] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {markingAll ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <CheckCheck size={15} />
                )}
                {markingAll ? "Updating..." : "Mark all as read"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#122425]/10 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap gap-2">
                {(["all", "unread"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeFilter(item)}
                    aria-pressed={filter === item}
                    className={[
                      "rounded-full px-4 py-2 text-xs font-semibold transition",
                      filter === item
                        ? "bg-[#eee5d7] text-[#122425]"
                        : "text-[#746f65] hover:bg-[#f5f1e9]",
                    ].join(" ")}
                  >
                    {item === "all" ? "All notifications" : "Unread"}
                  </button>
                ))}
              </div>

              <span className="text-xs text-[#938b7e]">
                {total} {total === 1 ? "notification" : "notifications"}
              </span>
            </div>

            {notice && (
              <div
                role="status"
                className="border-b border-emerald-900/10 bg-emerald-50 px-5 py-3 text-sm text-emerald-900 sm:px-6"
              >
                {notice}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex flex-col gap-3 border-b border-red-900/10 bg-red-50 px-5 py-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <span>{error}</span>

                <button
                  type="button"
                  onClick={() => void loadNotifications(true)}
                  disabled={refreshing}
                  className="self-start font-semibold underline disabled:opacity-50"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#746f65]">
                <LoaderCircle size={20} className="animate-spin" />
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f1e9] text-[#b18443]">
                  <Bell size={23} strokeWidth={1.5} />
                </div>

                <h3 className="mt-5 font-serif text-2xl italic text-[#122425]">
                  {filter === "unread"
                    ? "You're all caught up"
                    : "No notifications yet"}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-[#746f65]">
                  {filter === "unread"
                    ? "There are no unread notifications for this account."
                    : "Operational notifications will appear here when relevant platform activity occurs."}
                </p>

                {filter === "unread" && (
                  <button
                    type="button"
                    onClick={() => changeFilter("all")}
                    className="mt-5 rounded-full border border-[#122425]/15 px-5 py-2.5 text-xs font-semibold text-[#122425] transition hover:bg-[#f5f1e9]"
                  >
                    View all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#122425]/10">
                {notifications.map((notification) => {
                  const busy = busyId === notification.id;

                  return (
                    <article
                      key={notification.id}
                      className={[
                        "flex flex-col gap-4 px-5 py-5 transition sm:flex-row sm:items-start sm:px-6",
                        notification.readAt ? "" : "bg-[#fbf8f2]",
                      ].join(" ")}
                    >
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee5d7] text-[#72552c]">
                        <Bell size={18} strokeWidth={1.6} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#f5f1e9] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#746f65]">
                            {typeLabels[notification.type] ?? "Notification"}
                          </span>

                          {!notification.readAt && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b682f]">
                              <span
                                className="h-2 w-2 rounded-full bg-[#b18443]"
                                aria-hidden="true"
                              />
                              Unread
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-sm font-semibold text-[#122425]">
                          {notification.title}
                        </h3>

                        <p className="mt-2 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-[#746f65]">
                          {notification.message}
                        </p>

                        <p className="mt-3 text-[11px] text-[#938b7e]">
                          {formatDate(notification.createdAt)}
                        </p>

                        {notification.actionUrl &&
                          notification.actionUrl.startsWith("/") &&
                          !notification.actionUrl.startsWith("//") &&
                          !notification.actionUrl.includes("\\") &&
                          !notification.actionUrl
                            .split("")
                            .some((character) => {
                              const code = character.charCodeAt(0);
                              return code <= 31 || code === 127;
                            }) && (
                            <Link
                              to={notification.actionUrl}
                              className="mt-3 inline-flex text-xs font-semibold text-[#8b682f] underline underline-offset-4 transition hover:text-[#122425]"
                            >
                              View details
                            </Link>
                          )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:pt-1">
                        {!notification.readAt && (
                          <button
                            type="button"
                            aria-label={`Mark ${notification.title} as read`}
                            title="Mark as read"
                            disabled={busy || markingAll}
                            onClick={() => void markAsRead(notification.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#122425]/10 text-[#122425] transition hover:bg-[#eee5d7] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {busy ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={17} />
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          aria-label={`Delete ${notification.title}`}
                          title="Delete notification"
                          disabled={busy || markingAll}
                          onClick={() =>
                            void deleteNotification(notification.id)
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#122425]/10 text-[#8c5149] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {busy ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
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
                    disabled={page <= 1 || refreshing}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-semibold transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages || refreshing}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-semibold transition hover:bg-[#f5f1e9] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
