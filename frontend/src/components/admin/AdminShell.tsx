import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  GalleryHorizontal,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Network,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react";

import { apiClient } from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import SolaisDarkLogo from "../../assets/logos/Solais Logo - Dark.png";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";

const primaryNavigation = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard },
  { label: "Events", to: "/admin/events", icon: CalendarDays },
  { label: "Tickets", to: "/admin/tickets", icon: Ticket },
  { label: "Orders", to: "/admin/orders", icon: ClipboardList },
  { label: "Attendees", to: "/admin/attendees", icon: Users },
  { label: "Issued Tickets", to: "/admin/issued-tickets", icon: Ticket },
];

const contentNavigation = [
  { label: "Gallery", to: "/admin/gallery", icon: GalleryHorizontal },
];

const partnershipNavigation = [
  { label: "Vendors", to: "/admin/vendors", icon: Network },
  { label: "Partners", to: "/admin/partners", icon: Users },
];

const operationsNavigation = [
  { label: "Communications", to: "/admin/communications", icon: Bell },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
];

function AdminNavigation({
  items,
  onNavigate,
  hasUnreadCommunications = false,
}: {
  items: typeof primaryNavigation;
  onNavigate?: () => void;
  hasUnreadCommunications?: boolean;
}) {
  return (
    <nav className="space-y-1.5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                "group flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-[#eee5d7] text-[#122425]"
                  : "text-[#eee8dd]/85 hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <Icon size={19} strokeWidth={1.5} />
            <span className="flex-1">{item.label}</span>
            {item.to === "/admin/communications" && hasUnreadCommunications && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500"
                aria-label="Unread communications"
                title="Unread communications"
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

function NavigationGroup({
  label,
  items,
  onNavigate,
  hasUnreadCommunications = false,
}: {
  label: string;
  items: typeof contentNavigation;
  onNavigate?: () => void;
  hasUnreadCommunications?: boolean;
}) {
  return (
    <div className="mt-8">
      <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]/65">
        {label}
      </p>
      <AdminNavigation
        items={items}
        onNavigate={onNavigate}
        hasUnreadCommunications={hasUnreadCommunications}
      />
    </div>
  );
}

export function AdminShell() {
  const { user, logout, sessionError, retrySession } = useAuth();
  const location = useLocation();

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasUnreadCommunications, setHasUnreadCommunications] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUnreadIndicators = async () => {
      try {
        const [notificationResponse, contactResponse] = await Promise.all([
          apiClient.get<{ data: { unreadCount: number } }>(
            "/notifications/unread-count",
          ),
          apiClient.get<{
            data: { messages: unknown[]; total: number };
          }>("/contact-messages/manage", {
            params: { page: 1, limit: 1, status: "NEW" },
          }),
        ]);

        if (!active) return;

        const unreadNotifications =
          notificationResponse.data.data.unreadCount > 0;
        const newContactMessages = contactResponse.data.data.total > 0;

        setHasUnreadCommunications(unreadNotifications || newContactMessages);
      } catch {
        // Keep the existing indicator state if a request fails.
      }
    };

    void loadUnreadIndicators();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-6">
        <div className="w-full max-w-lg rounded-[2rem] bg-[#12100d] p-8 text-center text-[#eee8dd] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
            SOLAÍS Administration
          </p>
          <h1 className="mt-4 font-serif text-4xl italic">
            We couldn&apos;t check your session
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#918879]">
            {sessionError}
          </p>
          <button
            type="button"
            onClick={() => void retrySession()}
            className="mt-7 inline-flex rounded-full bg-[#eee5d7] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#122425] transition hover:bg-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-6">
        <div className="w-full max-w-lg rounded-[2rem] bg-[#12100d] p-8 text-center text-[#eee8dd] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
            SOLAÍS Administration
          </p>
          <h1 className="mt-4 font-serif text-4xl italic">Access restricted</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#918879]">
            You do not have the required administrator permissions to access
            this area.
          </p>
          <Link
            to="/account"
            className="mt-7 inline-flex rounded-full bg-[#eee5d7] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#122425] transition hover:bg-white"
          >
            Return to account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e9] text-[#122425]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside className="hidden w-[340px] shrink-0 flex-col border-r border-[#122425]/10 bg-[#122425] lg:flex">
          <div className="flex h-[142px] items-center justify-center border-b border-white/10">
            <Link to="/" className="block">
              <img
                src={SolaisDarkLogo}
                alt="SOLAÍS Lifestyle"
                className="h-[142px] w-[282px] object-contain"
              />
            </Link>
          </div>

          <div className="flex flex-1 flex-col px-6 py-9">
            {/* Identity */}
            <div className="mb-8 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                SOLAÍS Administration
              </p>
              <p className="mt-4 truncate text-sm text-[#eee8dd]">
                {user.accountId}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#eee8dd]/35">
                Administrator
              </p>
            </div>

            {/* Primary */}
            <AdminNavigation items={primaryNavigation} />

            {/* Content */}
            <NavigationGroup label="Content" items={contentNavigation} />

            {/* Partnerships */}
            <NavigationGroup
              label="Partnerships"
              items={partnershipNavigation}
            />

            {/* Operations */}
            <NavigationGroup
              label="Operations"
              items={operationsNavigation}
              hasUnreadCommunications={hasUnreadCommunications}
            />

            {/* System */}
            <div className="mt-8">
              <p className="mb-3 px-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]/65">
                System
              </p>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  [
                    "group flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm transition-all duration-200",
                    isActive
                      ? "bg-[#eee5d7] text-[#122425]"
                      : "text-[#eee8dd]/85 hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                <Settings size={19} strokeWidth={1.5} />
                <span>Settings</span>
              </NavLink>
            </div>

            {/* Logout */}
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(true)}
                className="group flex w-full items-center gap-4 rounded-xl px-5 py-3.5 text-sm text-[#eee8dd]/70 transition-all duration-200 hover:bg-white/5 hover:text-[#eee5d7]"
              >
                <LogOut
                  size={19}
                  strokeWidth={1.5}
                  className="transition-colors group-hover:text-[#c99b55]"
                />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="min-w-0 flex-1 bg-[#f5f1e9]">
          {/* Mobile header */}
          <header className="flex h-[108px] items-center justify-between border-b border-white/10 bg-[#122425] px-5 lg:hidden">
            <Link to="/" className="block">
              <img
                src={SolaisDarkLogo}
                alt="SOLAÍS Lifestyle"
                className="h-[108px] w-[200px] object-contain"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-[#eee8dd] transition hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <X size={22} strokeWidth={1.5} />
              ) : (
                <Menu size={22} strokeWidth={1.5} />
              )}
            </button>
          </header>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="border-b border-white/10 bg-[#122425] lg:hidden">
              <div className="max-h-[calc(100vh-108px)] overflow-y-auto px-5 pb-6 pt-4">
                <div className="mb-5 border-b border-white/10 px-2 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                    SOLAÍS Administration
                  </p>
                  <p className="mt-3 truncate text-sm text-[#eee8dd]">
                    {user.accountId}
                  </p>
                </div>

                <AdminNavigation
                  items={primaryNavigation}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                <NavigationGroup
                  label="Content"
                  items={contentNavigation}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                <NavigationGroup
                  label="Partnerships"
                  items={partnershipNavigation}
                  onNavigate={() => setMobileMenuOpen(false)}
                />

                <NavigationGroup
                  label="Operations"
                  items={operationsNavigation}
                  onNavigate={() => setMobileMenuOpen(false)}
                  hasUnreadCommunications={hasUnreadCommunications}
                />

                <div className="mt-8 border-t border-white/10 pt-5">
                  <NavLink
                    to="/admin/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm transition-all duration-200",
                        isActive
                          ? "bg-[#eee5d7] text-[#122425]"
                          : "text-[#eee8dd]/85 hover:bg-white/5 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Settings size={19} strokeWidth={1.5} />
                    <span>Settings</span>
                  </NavLink>
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLogoutModalOpen(true);
                    }}
                    className="group flex w-full items-center gap-4 rounded-xl px-5 py-3.5 text-sm text-[#eee8dd]/70 transition-all duration-200 hover:bg-white/5 hover:text-[#eee5d7]"
                  >
                    <LogOut
                      size={19}
                      strokeWidth={1.5}
                      className="transition-colors group-hover:text-[#c99b55]"
                    />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page content */}
          <div className="mx-auto w-full max-w-[1440px] px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <Outlet />
          </div>
        </main>
      </div>

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          setLogoutModalOpen(false);
          void logout();
        }}
      />
    </div>
  );
}
