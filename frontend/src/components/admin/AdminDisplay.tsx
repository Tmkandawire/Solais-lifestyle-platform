import type { ReactNode } from "react";

export function StatusBadge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5f6663]">
        {label}
      </p>
      <div className="mt-2 wrap-break-word text-sm text-[#122425]">
        {children}
      </div>
    </div>
  );
}
