import {
  Activity,
  Bell,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Globe,
  Image,
  LockKeyhole,
  Mail,
  Megaphone,
  MonitorCog,
  ShieldCheck,
  SlidersHorizontal,
  Ticket,
  WalletCards,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

type SettingStatus = "Available" | "Configured" | "Pending" | "Not connected";

type SettingItem = {
  title: string;
  description: string;
  status: SettingStatus;
  icon: typeof Globe;
};

const platformItems: SettingItem[] = [
  {
    title: "Event management",
    description: "Create, publish, edit and manage event information.",
    status: "Available",
    icon: Globe,
  },
  {
    title: "Gallery management",
    description: "Manage gallery media and control publication visibility.",
    status: "Available",
    icon: Image,
  },
  {
    title: "Announcements",
    description: "Publish announcements for the public announcement feed.",
    status: "Available",
    icon: Megaphone,
  },
  {
    title: "Contact enquiries",
    description:
      "Review and manage messages submitted through the contact form.",
    status: "Available",
    icon: Mail,
  },
];

const commerceItems: SettingItem[] = [
  {
    title: "Ticket catalogue",
    description: "Manage event ticket types and their availability.",
    status: "Available",
    icon: Ticket,
  },
  {
    title: "Payment processing",
    description:
      "Payment provider integration remains pending client confirmation and provider documentation.",
    status: "Pending",
    icon: CreditCard,
  },
  {
    title: "Payment credentials",
    description:
      "Provider credentials and production endpoints have not been configured.",
    status: "Not connected",
    icon: WalletCards,
  },
];

const securityItems: SettingItem[] = [
  {
    title: "Administrator access",
    description:
      "The admin portal is restricted to accounts with administrator roles.",
    status: "Configured",
    icon: ShieldCheck,
  },
  {
    title: "Authenticated sessions",
    description:
      "Admin access uses the platform's existing authentication and session checks.",
    status: "Configured",
    icon: LockKeyhole,
  },
];

function StatusBadge({ status }: { status: SettingStatus }) {
  const styles: Record<SettingStatus, string> = {
    Available: "border-[#8ab99b]/35 bg-[#8ab99b]/10 text-[#315f49]",
    Configured: "border-[#8ab99b]/35 bg-[#8ab99b]/10 text-[#315f49]",
    Pending: "border-[#c9a96a]/35 bg-[#c9a96a]/10 text-[#806238]",
    "Not connected": "border-[#a97979]/30 bg-[#a97979]/10 text-[#704545]",
  };

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      {status === "Available" || status === "Configured" ? (
        <CheckCircle2 size={12} />
      ) : (
        <AlertCircle size={12} />
      )}
      {status}
    </span>
  );
}

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Globe;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#122425]/10 bg-white/70">
      <div className="flex items-start gap-4 border-b border-[#122425]/10 px-5 py-6 sm:px-7">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#122425]/5 text-[#b48643]">
          <Icon size={19} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-serif text-2xl tracking-tight text-[#122425]">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-6 text-[#122425]/55">
            {description}
          </p>
        </div>
      </div>
      <div className="px-5 sm:px-7">{children}</div>
    </section>
  );
}

function SettingRow({
  title,
  description,
  icon: Icon,
  status,
  to,
}: SettingItem & { to?: string }) {
  const content = (
    <div className="flex flex-col gap-3 border-b border-[#122425]/10 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5f1e9] text-[#122425]/60">
          <Icon size={16} strokeWidth={1.6} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#122425]">{title}</p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#122425]/55">
            {description}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-3 pl-12 sm:justify-end sm:pl-0">
        <StatusBadge status={status} />
        {to && (
          <ChevronRight
            size={16}
            className="text-[#122425]/35"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="block rounded-xl transition hover:bg-[#f5f1e9]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b48643]"
      >
        {content}
      </Link>
    );
  }

  return content;
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 pb-10">
      <section className="rounded-[28px] border border-[#122425]/10 bg-white/60 px-6 py-8 sm:px-9 sm:py-10 lg:px-11">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#b48643]">
              SOLAÍS Administration
            </p>
            <h1 className="mt-4 font-serif text-5xl leading-none tracking-[-0.035em] text-[#122425] sm:text-6xl">
              Settings
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#122425]/60">
              Review platform capabilities, commerce integrations and
              administrative security from one place.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-full border border-[#c9a96a]/30 bg-[#c9a96a]/10 px-4 py-3 xl:self-auto">
            <MonitorCog size={17} className="text-[#a57935]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806238]">
              Platform configuration
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/45">
              Platform modules
            </p>
            <SlidersHorizontal size={17} className="text-[#b48643]" />
          </div>
          <p className="mt-5 font-serif text-4xl text-[#122425]">4</p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/50">
            Available operational areas listed below.
          </p>
        </div>
        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/45">
              Commerce integration
            </p>
            <CreditCard size={17} className="text-[#b48643]" />
          </div>
          <p className="mt-5 font-serif text-3xl text-[#122425]">Pending</p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/50">
            Awaiting payment provider confirmation.
          </p>
        </div>
        <div className="rounded-2xl border border-[#122425]/10 bg-white/70 p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/45">
              Admin access
            </p>
            <ShieldCheck size={17} className="text-[#b48643]" />
          </div>
          <p className="mt-5 font-serif text-3xl text-[#122425]">Protected</p>
          <p className="mt-2 text-xs leading-5 text-[#122425]/50">
            Administrator role checks are in place.
          </p>
        </div>
      </section>

      <SettingsCard
        title="Platform & content"
        description="Operational areas currently available in the administration portal."
        icon={Globe}
      >
        {platformItems.map((item) => (
          <SettingRow
            key={item.title}
            {...item}
            to={
              item.title === "Gallery management"
                ? "/admin/gallery"
                : item.title === "Announcements"
                  ? "/admin/announcements"
                  : item.title === "Contact enquiries"
                    ? "/admin/communications"
                    : item.title === "Event management"
                      ? "/admin/events"
                      : undefined
            }
          />
        ))}
      </SettingsCard>

      <SettingsCard
        title="Ticketing & payments"
        description="Current commerce capabilities and outstanding provider dependencies."
        icon={WalletCards}
      >
        {commerceItems.map((item) => (
          <SettingRow key={item.title} {...item} />
        ))}
        <div className="my-5 rounded-2xl border border-[#c9a96a]/25 bg-[#c9a96a]/[0.08] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-[#a57935]" />
            <div>
              <p className="text-sm font-medium text-[#122425]">
                Payment setup requires client input
              </p>
              <p className="mt-1 text-xs leading-6 text-[#122425]/60">
                The payment provider, API endpoints, credentials and integration
                instructions must be confirmed before payment processing can be
                completed. No provider has been selected here.
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Communications"
        description="Review the communications tools available to administrators."
        icon={Bell}
      >
        <SettingRow
          title="Announcements"
          description="Create, publish and manage platform announcements."
          status="Available"
          icon={Megaphone}
          to="/admin/announcements"
        />
        <SettingRow
          title="Contact enquiries"
          description="Review incoming enquiries and manage their status."
          status="Available"
          icon={Mail}
          to="/admin/communications"
        />
        <SettingRow
          title="Automated email delivery"
          description="An email delivery provider has not been connected in the current configuration."
          status="Not connected"
          icon={Activity}
        />
      </SettingsCard>

      <SettingsCard
        title="Security & access"
        description="Visibility into the current administrative access model."
        icon={ShieldCheck}
      >
        {securityItems.map((item) => (
          <SettingRow key={item.title} {...item} />
        ))}
        <div className="flex flex-col gap-3 border-t border-[#122425]/10 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#122425]">
              Account and access management
            </p>
            <p className="mt-1 text-xs leading-5 text-[#122425]/55">
              Review the existing account area. Additional administrator
              management controls can be added when supported by the backend.
            </p>
          </div>
          <Link
            to="/account"
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#122425]/15 px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#122425]/70 transition hover:border-[#c9a96a] hover:text-[#122425] sm:self-auto"
          >
            Account area
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </SettingsCard>

      <section className="rounded-2xl border border-dashed border-[#122425]/15 bg-white/35 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Activity size={18} className="mt-0.5 shrink-0 text-[#b48643]" />
          <div>
            <h2 className="text-sm font-medium text-[#122425]">
              About these settings
            </h2>
            <p className="mt-2 max-w-3xl text-xs leading-6 text-[#122425]/55">
              This page reports current platform capabilities and known
              integration status. It does not change production configuration.
              Editable settings will be enabled when their corresponding backend
              persistence and validation are available.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
