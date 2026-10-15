import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  CalendarDays,
  Ticket,
  ShoppingBag,
  UserRound,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Megaphone,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import SolaisDarkLogo from "../../assets/logos/Solais Logo - Dark.png";
import { LogoutConfirmModal } from "../ui/LogoutConfirmModal";
import { useEffect, useState } from "react";
import { getUnreadNotificationCount } from "../../api/notification.api";
import { getAnnouncementUnreadStatus } from "../../api/announcement.api";
import {
  getAccountThemePreference,
  type ThemePreference,
} from "../../api/account.api";

const navigation = [
  { label: "Overview", to: "/account", icon: LayoutDashboard },
  { label: "My Events", to: "/account/events", icon: CalendarDays },
  { label: "My Tickets", to: "/account/tickets", icon: Ticket },
  { label: "My Orders", to: "/account/orders", icon: ShoppingBag },
  { label: "Notifications", to: "/account/notifications", icon: Bell },
  { label: "Announcements", to: "/account/announcements", icon: Megaphone },
  { label: "My Account", to: "/account/profile", icon: UserRound },
  { label: "Settings", to: "/account/settings", icon: Settings },
];

export function AttendeeShell() {
  const { user, logout, sessionError, retrySession } = useAuth();
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemePreference>("LIGHT");

  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadThemePreference(): Promise<void> {
      try {
        const preference = await getAccountThemePreference();

        if (active) {
          setTheme(preference.theme);
        }
      } catch {
        // Keep the attendee portal usable if loading the preference fails.
        if (active) {
          setTheme("LIGHT");
        }
      }
    }

    void loadThemePreference();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationCount();

        if (active) {
          setUnreadCount(count);
        }
      } catch {
        // Keep the navigation usable if the count request fails.
      }
    };

    const loadAnnouncementStatus = async () => {
      try {
        const hasNew = await getAnnouncementUnreadStatus();

        if (active) {
          setHasNewAnnouncements(hasNew);
        }
      } catch {
        // Keep the existing status if the request fails.
      }
    };

    void loadUnreadCount();
    void loadAnnouncementStatus();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f1e9] px-6">
        <div className="w-full max-w-lg rounded-[2rem] bg-[#12100d] p-8 text-center text-[#eee8dd] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
            Member Account
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

  return (
    <div
      className={`attendee-portal min-h-screen ${
        theme === "DARK" ? "dark" : ""
      }`}
      style={{
        backgroundColor: "var(--attendee-background)",
        color: "var(--attendee-text)",
      }}
    >
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
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
            <div className="mb-8 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                Member Account · Attendee
              </p>

              <p className="mt-4 truncate text-sm text-[#eee8dd]">
                {user?.accountId ?? "SOLAÍS Member"}
              </p>
            </div>

            <nav className="space-y-1.5">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/account"}
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

                    {item.to === "/account/notifications" &&
                      unreadCount > 0 && (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#c99b55] px-1.5 py-0.5 text-[10px] font-semibold text-[#122425]">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}

                    {item.to === "/account/announcements" &&
                      hasNewAnnouncements && (
                        <span
                          aria-label="New announcements"
                          title="New announcements"
                          className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                        />
                      )}
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto">
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
        <main
          className="min-w-0 flex-1"
          style={{ backgroundColor: "var(--attendee-background)" }}
        >
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
              <div className="px-5 pb-6 pt-4">
                {/* Account identity */}
                <div className="mb-5 border-b border-white/10 px-2 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
                    Member Account · Attendee
                  </p>

                  <p className="mt-3 truncate text-sm text-[#eee8dd]">
                    {user?.accountId ?? "SOLAÍS Member"}
                  </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1.5">
                  {navigation.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/account"}
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
                        <Icon size={19} strokeWidth={1.5} />

                        <span className="flex-1">{item.label}</span>

                        {item.to === "/account/notifications" &&
                          unreadCount > 0 && (
                            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#c99b55] px-1.5 py-0.5 text-[10px] font-semibold text-[#122425]">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          )}

                        {item.to === "/account/announcements" &&
                          hasNewAnnouncements && (
                            <span
                              aria-label="New announcements"
                              title="New announcements"
                              className="h-2 w-2 shrink-0 rounded-full bg-red-500"
                            />
                          )}
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Mobile logout */}
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
            <Outlet context={{ theme, setTheme }} />
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
