import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Globe,
  Handshake,
  Mail,
  Phone,
  RefreshCw,
  UserCheck,
} from "lucide-react";

import ApplicationConfirmationModal, {
  type ApplicationConfirmationAction,
} from "../../../components/admin/ApplicationConfirmationModal";
import ApplicationStatusBadge from "../../../components/admin/ApplicationStatusBadge";

import {
  useAdminPartnerApplication,
  useApprovePartnerApplication,
  useDeletePartnerApplication,
  useRejectPartnerApplication,
} from "../../../hooks/usePartnerApplication";
import { useToast } from "../../../hooks/useToast";

function formatDateTime(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
        strokeWidth={1.5}
      />
      <div className="min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
          {label}
        </p>
        <p className="mt-1 break-words text-sm text-[#122425]/80">{value}</p>
      </div>
    </div>
  );
}

export default function AdminPartnerApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { application, isLoading, error, refresh } =
    useAdminPartnerApplication(id);

  const { approve, isLoading: isApproving } = useApprovePartnerApplication();
  const { reject, isLoading: isRejecting } = useRejectPartnerApplication();
  const { remove, isLoading: isDeleting } = useDeletePartnerApplication();

  const [confirmation, setConfirmation] =
    useState<ApplicationConfirmationAction | null>(null);

  const isMutating = isApproving || isRejecting || isDeleting;
  const isPending = application?.status === "PENDING";

  async function handleConfirm(adminNotes?: string) {
    if (!application || !confirmation) {
      return;
    }

    try {
      if (confirmation === "approve") {
        await approve(application.id, adminNotes ? { adminNotes } : {});
        toast.success("Partner application approved.", {
          description: `${application.organisationName} has been approved.`,
        });
        setConfirmation(null);
        await refresh();
      } else if (confirmation === "reject") {
        await reject(application.id, adminNotes ? { adminNotes } : {});
        toast.success("Partner application rejected.", {
          description: `${application.organisationName} has been rejected.`,
        });
        setConfirmation(null);
        await refresh();
      } else {
        await remove(application.id);
        toast.success("Partner application deleted.", {
          description: `${application.organisationName} has been removed.`,
        });
        navigate("/admin/partners");
      }
    } catch {
      // Mutation hooks expose their own error state.
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#f5f1e9]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#f5f1e9]" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <section className="rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-6">
        <p className="text-sm font-semibold text-[#8f3f39]">
          Unable to load this partner application
        </p>
        <p className="mt-1 text-sm text-[#8f3f39]/65">
          {error ?? "The application could not be found."}
        </p>
        <button
          type="button"
          onClick={() => navigate("/admin/partners")}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#a84b45]/20 px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f3f39] transition hover:bg-[#a84b45]/8"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
          Back to partner applications
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/partners")}
            className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/50 transition hover:text-[#122425]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.7} />
            Partner applications
          </button>

          <div className="mt-4 flex items-center gap-3">
            <h1 className="font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
              {application.organisationName}
            </h1>
            <ApplicationStatusBadge status={application.status} />
          </div>

          <p className="mt-2 text-xs font-mono text-[#122425]/30">
            {application.id}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={refresh}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#122425]/8 bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#122425]/55 transition hover:bg-[#f5f1e9]"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.7} />
            Refresh
          </button>

          {isPending && (
            <>
              <button
                type="button"
                onClick={() => setConfirmation("approve")}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2f6b4f] px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#25543e]"
              >
                Approve
              </button>

              <button
                type="button"
                onClick={() => setConfirmation("reject")}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#a84b45] px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#8f3f39]"
              >
                Reject
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setConfirmation("delete")}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[#a84b45]/20 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a84b45] transition hover:bg-[#a84b45]/8"
          >
            Delete
          </button>
        </div>
      </div>

      {/* CONTACT + PARTNERSHIP DETAILS */}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Contact
          </p>

          <div className="mt-5 space-y-5">
            <DetailRow
              icon={UserCheck}
              label="Contact person"
              value={application.contactPerson}
            />
            <DetailRow icon={Mail} label="Email" value={application.email} />
            <DetailRow
              icon={Phone}
              label="Phone"
              value={application.phoneNumber}
            />
            {application.websiteOrSocial && (
              <DetailRow
                icon={Globe}
                label="Website / Social"
                value={application.websiteOrSocial}
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Partnership
          </p>

          <div className="mt-5 space-y-5">
            <DetailRow
              icon={Handshake}
              label="Partnership type"
              value={application.partnershipType}
            />

            <div className="flex items-start gap-3">
              <CalendarDays
                className="mt-0.5 h-4 w-4 shrink-0 text-[#c99b55]"
                strokeWidth={1.5}
              />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
                  Submitted
                </p>
                <p className="mt-1 text-sm text-[#122425]/80">
                  {formatDateTime(application.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ORGANISATION / INTEREST / CONTRIBUTION */}
      <section className="grid gap-5">
        <div className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            About the organisation
          </p>
          <p className="mt-4 text-sm leading-7 text-[#122425]/70">
            {application.organisationDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Why partner with Solaís
          </p>
          <p className="mt-4 text-sm leading-7 text-[#122425]/70">
            {application.partnershipInterest}
          </p>
        </div>

        <div className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
            Proposed contribution
          </p>
          <p className="mt-4 text-sm leading-7 text-[#122425]/70">
            {application.contributionDescription}
          </p>
        </div>
      </section>

      {/* REVIEW */}
      <section className="rounded-2xl border border-[#122425]/8 bg-white p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#c99b55]">
          Review
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
              Reviewed at
            </p>
            <p className="mt-1 text-sm text-[#122425]/70">
              {formatDateTime(application.reviewedAt)}
            </p>
          </div>

          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
              Reviewed by
            </p>
            <p className="mt-1 text-sm text-[#122425]/70">
              {application.reviewedBy
                ? `${application.reviewedBy.firstName} ${application.reviewedBy.lastName}`
                : "—"}
            </p>
          </div>
        </div>

        {application.adminNotes && (
          <div className="mt-5 border-t border-[#122425]/8 pt-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/40">
              Admin notes
            </p>
            <p className="mt-2 text-sm leading-6 text-[#122425]/70">
              {application.adminNotes}
            </p>
          </div>
        )}
      </section>

      <ApplicationConfirmationModal
        isOpen={confirmation !== null}
        isLoading={isMutating}
        action={confirmation ?? "approve"}
        entityLabel="partner application"
        entityName={application.organisationName}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
