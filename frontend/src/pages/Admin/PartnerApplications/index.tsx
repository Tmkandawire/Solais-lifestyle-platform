import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Handshake,
  Mail,
  RefreshCw,
} from "lucide-react";

import ApplicationActionsMenu from "../../../components/admin/ApplicationActionsMenu";
import ApplicationConfirmationModal, {
  type ApplicationConfirmationAction,
} from "../../../components/admin/ApplicationConfirmationModal";
import ApplicationStatusBadge from "../../../components/admin/ApplicationStatusBadge";

import {
  useAdminPartnerApplications,
  useApprovePartnerApplication,
  useDeletePartnerApplication,
  useRejectPartnerApplication,
} from "../../../hooks/usePartnerApplication";
import { useToast } from "../../../hooks/useToast";

import type {
  AdminPartnerApplication,
  PartnerApplicationListParams,
} from "../../../types/partner-application";
import type { PartnerApplicationStatus } from "../../../types/partner-application-status";

const STATUS_OPTIONS: Array<{
  value: PartnerApplicationStatus | "";
  label: string;
}> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminPartnerApplicationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PartnerApplicationStatus | "">("");
  const [confirmation, setConfirmation] = useState<{
    application: AdminPartnerApplication;
    action: ApplicationConfirmationAction;
  } | null>(null);

  const params = useMemo<PartnerApplicationListParams>(
    () => ({
      page,
      limit: 20,
      ...(status ? { status } : {}),
    }),
    [page, status],
  );

  const { applications, meta, isLoading, error, refresh } =
    useAdminPartnerApplications(params);

  const { approve, isLoading: isApproving } = useApprovePartnerApplication();
  const { reject, isLoading: isRejecting } = useRejectPartnerApplication();
  const { remove, isLoading: isDeleting } = useDeletePartnerApplication();

  const hasApplications = applications.length > 0;
  const hasPagination = meta.totalPages > 1;
  const isMutating = isApproving || isRejecting || isDeleting;

  function handleStatusChange(value: PartnerApplicationStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));
  }

  function handleNextPage() {
    setPage((current) => Math.min(meta.totalPages, current + 1));
  }

  function handleView(id: string) {
    navigate(`/admin/partners/${id}`);
  }

  function openConfirmation(id: string, action: ApplicationConfirmationAction) {
    const application = applications.find((item) => item.id === id);

    if (!application) {
      return;
    }

    setConfirmation({ application, action });
  }

  async function handleConfirm(adminNotes?: string) {
    if (!confirmation) {
      return;
    }

    const { application, action } = confirmation;

    try {
      if (action === "approve") {
        await approve(application.id, adminNotes ? { adminNotes } : {});
        toast.success("Partner application approved.", {
          description: `${application.organisationName} has been approved.`,
        });
      } else if (action === "reject") {
        await reject(application.id, adminNotes ? { adminNotes } : {});
        toast.success("Partner application rejected.", {
          description: `${application.organisationName} has been rejected.`,
        });
      } else {
        await remove(application.id);
        toast.success("Partner application deleted.", {
          description: `${application.organisationName} has been removed.`,
        });
      }

      setConfirmation(null);
      await refresh();
    } catch {
      // Mutation hooks expose their own error state.
    }
  }

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
              Partnerships
            </p>

            {!isLoading && (
              <span className="rounded-full border border-[#122425]/10 bg-white px-2.5 py-1 text-[10px] font-semibold text-[#122425]/50">
                {meta.total.toLocaleString("en-US")}{" "}
                {meta.total === 1 ? "application" : "applications"}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
            Partner Applications
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/55">
            Review, approve or decline partnership proposals submitted through
            the public partner form.
          </p>
        </div>
      </div>

      {/* FILTER BAR */}
      <section className="rounded-2xl border border-[#122425]/8 bg-white p-4 shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[200px_134px] md:items-center md:justify-start">
          <select
            value={status}
            onChange={(event) =>
              handleStatusChange(
                event.target.value as PartnerApplicationStatus | "",
              )
            }
            className="h-11 w-full rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 px-4 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/50 focus:bg-white"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#122425]/8 bg-[#f5f1e9]/55 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              strokeWidth={1.7}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#8f3f39]">
                Unable to load partner applications
              </p>
              <p className="mt-1 text-sm text-[#8f3f39]/65">{error}</p>
            </div>

            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-[#a84b45]/20 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f3f39] transition hover:bg-[#a84b45]/8"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
              Try again
            </button>
          </div>
        </section>
      )}

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.04)]">
        <div className="flex items-center justify-between border-b border-[#122425]/8 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
              Applications
            </p>
            <p className="mt-1 text-sm text-[#122425]/55">
              {meta.total > 0
                ? `${meta.total.toLocaleString("en-US")} applications`
                : "No applications available"}
            </p>
          </div>

          {isLoading && hasApplications && (
            <div className="flex items-center gap-2 text-xs text-[#122425]/40">
              <RefreshCw
                className="h-3.5 w-3.5 animate-spin"
                strokeWidth={1.7}
              />
              Updating
            </div>
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[#122425]/8 bg-[#f5f1e9]/45">
                <th className="px-6 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Organisation
                </th>
                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Contact
                </th>
                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Partnership type
                </th>
                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Submitted
                </th>
                <th className="px-5 py-4 text-left text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Status
                </th>
                <th className="w-40 px-5 py-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-[#122425]/6">
              {isLoading && !hasApplications ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`partner-app-skeleton-${index}`}>
                    <td className="px-6 py-5" colSpan={6}>
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-[#f5f1e9]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-1/3 animate-pulse rounded bg-[#f5f1e9]" />
                          <div className="h-3 w-1/5 animate-pulse rounded bg-[#f5f1e9]" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : hasApplications ? (
                applications.map((application) => (
                  <tr
                    key={application.id}
                    className="group transition-colors hover:bg-[#f5f1e9]/45"
                  >
                    <td className="px-6 py-5">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
                          <Handshake
                            className="h-5 w-5 text-[#122425]/30"
                            strokeWidth={1.5}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#122425]">
                            {application.organisationName}
                          </p>
                          <p className="mt-1 truncate font-mono text-[10px] text-[#122425]/30">
                            {application.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-[#122425]/80">
                        {application.contactPerson}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#122425]/40">
                        <Mail className="h-3.5 w-3.5" strokeWidth={1.6} />
                        <span className="truncate">{application.email}</span>
                      </div>
                    </td>

                    <td className="px-5 py-5">
                      <span className="text-sm text-[#122425]/70">
                        {application.partnershipType}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <span className="text-sm text-[#122425]/60">
                        {formatDate(application.createdAt)}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <ApplicationStatusBadge status={application.status} />
                    </td>

                    <td className="px-5 py-5">
                      <ApplicationActionsMenu
                        id={application.id}
                        status={application.status}
                        onView={handleView}
                        onApprove={(id) => openConfirmation(id, "approve")}
                        onReject={(id) => openConfirmation(id, "reject")}
                        onDelete={(id) => openConfirmation(id, "delete")}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#122425]/8 bg-[#f5f1e9]">
                        <Handshake
                          className="h-6 w-6 text-[#122425]/25"
                          strokeWidth={1.4}
                        />
                      </div>
                      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
                        Partner applications
                      </p>
                      <h2 className="mt-2 font-serif text-2xl italic text-[#122425]">
                        No applications found
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#122425]/45">
                        Try adjusting the status filter, or check back once new
                        partner proposals come in.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div className="space-y-3 p-4 md:hidden">
          {isLoading && !hasApplications ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`mobile-partner-app-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-[#122425]/8 bg-white p-4"
              >
                <div className="h-4 w-3/4 rounded bg-[#f5f1e9]" />
                <div className="mt-3 h-3 w-1/2 rounded bg-[#f5f1e9]" />
              </div>
            ))
          ) : hasApplications ? (
            applications.map((application) => (
              <article
                key={`mobile-${application.id}`}
                className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_8px_30px_rgba(18,36,37,0.04)]"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold leading-5 text-[#122425]">
                        {application.organisationName}
                      </p>
                      <p className="mt-1 text-xs text-[#122425]/50">
                        {application.contactPerson}
                      </p>
                    </div>
                    <ApplicationStatusBadge status={application.status} />
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-[#122425]/50">
                    <p>{application.partnershipType}</p>
                    <p>{formatDate(application.createdAt)}</p>
                  </div>

                  <div className="mt-4 border-t border-[#122425]/6 pt-3">
                    <ApplicationActionsMenu
                      id={application.id}
                      status={application.status}
                      onView={handleView}
                      onApprove={(id) => openConfirmation(id, "approve")}
                      onReject={(id) => openConfirmation(id, "reject")}
                      onDelete={(id) => openConfirmation(id, "delete")}
                    />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-[#122425]/8 bg-white px-5 py-16 text-center">
              <p className="text-sm text-[#122425]/50">
                No partner applications found.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {hasPagination && (
          <div className="flex flex-col gap-4 border-t border-[#122425]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-[#122425]/40">
              Showing page{" "}
              <span className="font-medium text-[#122425]/65">{meta.page}</span>{" "}
              of{" "}
              <span className="font-medium text-[#122425]/65">
                {meta.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={meta.page <= 1 || isLoading}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-[#122425]/10 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.7} />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={meta.page >= meta.totalPages || isLoading}
                className="inline-flex h-10 items-center gap-1 rounded-full border border-[#122425]/10 px-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#122425]/55 transition hover:bg-[#f5f1e9] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-25"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={1.7} />
              </button>
            </div>
          </div>
        )}
      </section>

      <ApplicationConfirmationModal
        isOpen={confirmation !== null}
        isLoading={isMutating}
        action={confirmation?.action ?? "approve"}
        entityLabel="partner application"
        entityName={confirmation?.application.organisationName ?? ""}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
