type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

function getStatusClasses(status: ApplicationStatus) {
  switch (status) {
    case "APPROVED":
      return "border-[#2f6b4f]/20 bg-[#2f6b4f]/8 text-[#2f6b4f]";

    case "REJECTED":
      return "border-[#a84b45]/20 bg-[#a84b45]/8 text-[#a84b45]";

    case "PENDING":
    default:
      return "border-[#c99b55]/25 bg-[#c99b55]/10 text-[#8d692f]";
  }
}

function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
    default:
      return "Pending";
  }
}

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function ApplicationStatusBadge({
  status,
  className = "",
}: ApplicationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusClasses(
        status,
      )} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export type { ApplicationStatus };
