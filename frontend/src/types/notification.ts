/**
 * Mirrors the NotificationType enum in the Prisma schema. Keep the two in
 * sync: any label or icon map keyed by this type should be a
 * Record<NotificationType, ...> so a new value fails to compile until handled.
 */
export type NotificationType =
  | "ORDER"
  | "PAYMENT"
  | "TICKET"
  | "EVENT"
  | "VENDOR_APPLICATION"
  | "PARTNER_APPLICATION"
  | "SYSTEM";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** App-relative path or HTTPS URL, validated by the backend. */
  actionUrl: string | null;
  /** ISO 8601 timestamp, or null while the notification is unread. */
  readAt: string | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  /** Notifications matching the current filter. */
  total: number;
  /** All unread notifications for the account, regardless of the filter. */
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}

export interface MarkAllNotificationsReadResult {
  updatedCount: number;
}
