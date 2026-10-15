import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Megaphone,
  RefreshCw,
} from "lucide-react";

import { apiClient } from "../../../api/client";
import type { ApiSuccessResponse } from "../../../types/api";
import { markAnnouncementsSeen } from "../../../api/announcement.api";

const PAGE_SIZE = 6;

interface Announcement {
  id: string;
  title: string;
  message: string;
  publishedAt: string;
}

interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function formatAnnouncementDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently published";

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function AttendeeAnnouncementsPage() {
  const [result, setResult] = useState<AnnouncementListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAnnouncements = async () => {
      try {
        const response = await apiClient.get<
          ApiSuccessResponse<AnnouncementListResponse>
        >("/announcements", {
          params: { page, limit: PAGE_SIZE },
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          const announcementData = response.data.data;

          setResult(announcementData);
          setError(null);

          // Only mark announcements seen after page 1 loads successfully.
          // The timestamp is taken from the actual server response.
          if (page === 1) {
            const newestAnnouncement = announcementData.announcements[0];

            if (newestAnnouncement?.publishedAt) {
              try {
                await markAnnouncementsSeen(newestAnnouncement.publishedAt);
              } catch {
                // Keep the page usable. The red dot remains until marking succeeds.
              }
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load announcements. Please try again.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchAnnouncements();

    return () => controller.abort();
  }, [page, reloadKey]);

  const refresh = () => {
    setLoading(true);
    setReloadKey((current) => current + 1);
  };

  const announcements = result?.announcements ?? [];
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="space-y-8 text-[var(--attendee-text)] sm:space-y-10">
      {/* Editorial hero */}
      <header className="relative overflow-hidden bg-[#122425] px-6 py-10 text-[#f5f1e9] sm:px-10 sm:py-14 lg:px-12 lg:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-64 w-64 rounded-full border border-[#c99b55]/20 sm:h-80 sm:w-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-8 top-8 h-40 w-40 rounded-full border border-[#c99b55]/15 sm:right-16 sm:top-12 sm:h-52 sm:w-52"
        />

        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#c99b55]">
              Member account / The latest
            </p>

            <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
              The Solaís
              <br />
              <span className="italic text-[#d8c5a1]">Announcement Board.</span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#f5f1e9]/65 sm:text-base">
              News, important updates, and things worth knowing about your
              Solaís experience.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t border-white/15 pt-5 sm:min-w-[170px] sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#c99b55]/40 text-[#c99b55]">
              <Megaphone size={21} strokeWidth={1.4} />
            </div>

            <div>
              <p className="font-serif text-3xl">
                {result ? result.total : "—"}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#f5f1e9]/60">
                Published updates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Page controls */}
      <section>
        <div className="flex flex-col gap-5 border-b border-[var(--attendee-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9b7740]">
              From the team
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              Noticeboard
            </h2>
            <p className="mt-2 text-sm text-[var(--attendee-text-muted)]">
              {result
                ? `${result.total} published announcement${result.total === 1 ? "" : "s"}`
                : "Announcements and updates from Solaís"}
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-10 w-fit items-center justify-center gap-2 border border-[var(--attendee-border)] px-4 text-xs font-medium text-[var(--attendee-text)] transition hover:border-[var(--attendee-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

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

        {/* Announcement content */}
        {loading ? (
          <div className="grid gap-5 py-7 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="min-h-64 animate-pulse border border-[var(--attendee-border)] bg-[var(--attendee-surface)] p-6 sm:p-8"
              >
                <div className="h-3 w-28 bg-[var(--attendee-surface-muted)]" />
                <div className="mt-8 h-6 w-3/4 bg-[var(--attendee-surface-muted)]" />
                <div className="mt-4 h-3 w-full bg-[var(--attendee-surface-muted)]" />
                <div className="mt-3 h-3 w-5/6 bg-[var(--attendee-surface-muted)]" />
                <div className="mt-3 h-3 w-2/3 bg-[var(--attendee-surface-muted)]" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center border-b border-[var(--attendee-border)] px-6 py-16 text-center sm:py-20">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#c99b55]/40 text-[#9b7740]">
              <Megaphone size={25} strokeWidth={1.3} />
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9b7740]">
              A quiet moment
            </p>

            <h3 className="mt-3 font-serif text-2xl sm:text-3xl">
              Nothing new to share.
            </h3>

            <p className="mt-3 max-w-sm text-sm leading-7 text-[var(--attendee-text-muted)]">
              There are no published announcements at the moment. When there’s
              something to share, you’ll find it here.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 py-7 md:grid-cols-2">
              {announcements.map((announcement, index) => (
                <article
                  key={announcement.id}
                  className="group flex min-w-0 flex-col border border-[var(--attendee-border)] bg-[var(--attendee-surface)] p-6 transition duration-300 hover:border-[var(--attendee-accent)] hover:bg-[var(--attendee-surface-muted)] sm:p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9b7740]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#c99b55]" />
                      Solaís update
                    </span>

                    <span className="font-serif text-xl italic text-[#122425]/20">
                      {String((page - 1) * PAGE_SIZE + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                  </div>

                  <h3 className="mt-7 break-words font-serif text-2xl leading-snug text-[var(--attendee-text)] sm:text-3xl">
                    {announcement.title}
                  </h3>

                  <div className="mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[var(--attendee-text-muted)]">
                    <CalendarDays
                      size={14}
                      strokeWidth={1.5}
                      className="text-[#9b7740]"
                    />
                    <time dateTime={announcement.publishedAt}>
                      {formatAnnouncementDate(announcement.publishedAt)}
                    </time>
                  </div>

                  <div className="my-6 h-px w-full bg-[var(--attendee-border)]" />

                  <p className="whitespace-pre-line break-words text-sm leading-7 text-[var(--attendee-text-muted)]">
                    {announcement.message}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-8">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--attendee-text-muted)]">
                      Official announcement
                    </span>

                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center border border-[#122425]/10 text-[#9b7740] transition group-hover:border-[#c99b55] group-hover:bg-[#122425] group-hover:text-[#f5f1e9]"
                    >
                      <ArrowDownRight size={17} strokeWidth={1.4} />
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
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
                    <ArrowLeft size={14} />
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
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
