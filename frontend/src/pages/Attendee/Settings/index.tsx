import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Check,
  ChevronRight,
  KeyRound,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  Mail,
  BadgeCheck,
  CircleAlert,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import {
  changePassword,
  updateAccountThemePreference,
  type ThemePreference,
} from "../../../api/account.api";
import { parseApiError } from "../../../api/errors";

type SettingsSection = "account" | "security" | "appearance";

const sections: Array<{
  id: SettingsSection;
  label: string;
  description: string;
}> = [
  {
    id: "account",
    label: "Account",
    description: "Your account information",
  },
  {
    id: "security",
    label: "Security",
    description: "Password and session security",
  },

  {
    id: "appearance",
    label: "Appearance",
    description: "Your visual preference",
  },
];

function SectionIcon({ section }: { section: SettingsSection }) {
  if (section === "account") {
    return <UserRound className="h-4 w-4" />;
  }

  if (section === "security") {
    return <ShieldCheck className="h-4 w-4" />;
  }

  return <Sun className="h-4 w-4" />;
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: import("react").ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#122425]/10 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-[#122425]">{label}</p>
        <p className="mt-1 max-w-xl text-xs leading-5 text-[#122425]/50">
          {description}
        </p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function AttendeeSettingsPage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const { theme, setTheme } = useOutletContext<{
    theme: ThemePreference;
    setTheme: React.Dispatch<React.SetStateAction<ThemePreference>>;
  }>();

  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("account");

  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [appearanceError, setAppearanceError] = useState<string | null>(null);
  const [appearanceSuccess, setAppearanceSuccess] = useState<string | null>(
    null,
  );

  const accountReference = user?.accountId ?? "Unavailable";
  const role = user?.role ?? "Unavailable";

  async function handlePasswordChange(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("Choose a password different from your current one.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });

      setPasswordSuccess("Password changed. Signing you out…");

      // The backend has already revoked every session and cleared the cookie.
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      const parsed = parseApiError(
        error,
        "Unable to change your password. Please try again.",
      );
      setPasswordError(parsed.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleAppearanceChange(
    nextTheme: ThemePreference,
  ): Promise<void> {
    if (nextTheme === theme || isSavingAppearance) {
      return;
    }

    const previousTheme = theme;

    setAppearanceError(null);
    setAppearanceSuccess(null);
    setIsSavingAppearance(true);

    // Apply the selection immediately for a responsive interface.
    setTheme(nextTheme);

    try {
      const updated = await updateAccountThemePreference(nextTheme);

      // Use the preference returned by the server as the final value.
      setTheme(updated.theme);

      setAppearanceSuccess(
        updated.theme === "DARK"
          ? "Dark appearance preference saved."
          : "Light appearance preference saved.",
      );
    } catch (error) {
      // Roll back the interface if the server cannot save the preference.
      setTheme(previousTheme);

      const parsed = parseApiError(
        error,
        "Unable to save your appearance preference. Please try again.",
      );

      setAppearanceError(parsed.message);
    } finally {
      setIsSavingAppearance(false);
    }
  }

  return (
    <div className="attendee-settings-page mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page introduction */}
      <section className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B48643]">
          SOLAÍS Lifestyle
        </p>

        <h1
          className={`mt-3 font-serif text-4xl italic tracking-tight sm:text-5xl ${
            theme === "DARK" ? "text-[#EEE8DD]" : "text-[#122425]"
          }`}
        >
          Settings
        </h1>

        <p
          className={`mt-3 max-w-2xl text-sm leading-7 ${
            theme === "DARK" ? "text-[#C5C9C5]" : "text-[#122425]/60"
          }`}
        >
          Manage your account preferences, security and appearance.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Section navigation */}
        <aside
          className={`h-fit rounded-3xl border p-3 ${
            theme === "DARK"
              ? "border-[#344441] bg-[#1B2926]"
              : "border-[#122425]/10 bg-white/60"
          }`}
        >
          <p className="px-4 pb-3 pt-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#122425]/35">
            Settings
          </p>

          <nav className="space-y-1">
            {sections.map((section) => {
              const active = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    active
                      ? "bg-[#122425] text-[#EEE8DD]"
                      : "text-[#122425]/65 hover:bg-[#122425]/5 hover:text-[#122425]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      active
                        ? "bg-[#C9A96A]/15 text-[#C9A96A]"
                        : "bg-[#122425]/5 text-[#122425]/50"
                    }`}
                  >
                    <SectionIcon section={section.id} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">
                      {section.label}
                    </span>

                    <span
                      className={`mt-0.5 block truncate text-[10px] ${
                        active ? "text-[#EEE8DD]/45" : "text-[#122425]/35"
                      }`}
                    >
                      {section.description}
                    </span>
                  </span>

                  <ChevronRight
                    className={`h-3.5 w-3.5 shrink-0 transition ${
                      active
                        ? "text-[#C9A96A]"
                        : "text-[#122425]/20 group-hover:text-[#122425]/40"
                    }`}
                  />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main>
          {/* Account */}
          {activeSection === "account" && (
            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                theme === "DARK"
                  ? "border-[#344441] bg-[#1B2926]"
                  : "border-[#122425]/10 bg-white/65"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#122425]/5">
                  <UserRound className="h-5 w-5 text-[#122425]/60" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B48643]">
                    Account
                  </p>

                  <h2 className="mt-2 font-serif text-3xl italic text-[#122425]">
                    Account information
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/50">
                    Review the identity currently associated with your SOLAÍS
                    session.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <SettingRow
                  label="Account reference"
                  description="Your unique account identifier within the SOLAÍS platform."
                >
                  <span className="font-mono text-xs text-[#122425]/55">
                    {accountReference}
                  </span>
                </SettingRow>

                <SettingRow
                  label="Account role"
                  description="The role currently assigned to your authenticated account."
                >
                  <span className="rounded-full bg-[#122425]/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#122425]/55">
                    {role}
                  </span>
                </SettingRow>

                <SettingRow
                  label="Personal details"
                  description="Your profile information as currently saved to your account."
                >
                  <div className="flex min-w-0 items-center gap-3 sm:min-w-55">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#122425]/5">
                      <UserRound className="h-4 w-4 text-[#122425]/55" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-[#122425]">
                        {profile
                          ? `${profile.firstName} ${profile.lastName}`.trim()
                          : "Profile unavailable"}
                      </p>
                      <p className="mt-1 text-[10px] text-[#122425]/45">
                        {profile
                          ? "Name on your account"
                          : "Unable to load profile details"}
                      </p>
                    </div>
                  </div>
                </SettingRow>

                <SettingRow
                  label="Email address"
                  description="Your registered email address and its current verification status."
                >
                  <div className="flex min-w-0 items-center gap-3 sm:min-w-55">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#122425]/5">
                      <Mail className="h-4 w-4 text-[#122425]/55" />
                    </div>

                    <div className="min-w-0">
                      <p className="break-all text-xs font-medium text-[#122425]">
                        {profile?.email ?? "Email unavailable"}
                      </p>

                      {profile?.emailVerifiedAt ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      ) : profile ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                          <CircleAlert className="h-3 w-3" />
                          Not verified
                        </span>
                      ) : (
                        <p className="mt-1 text-[10px] text-[#122425]/45">
                          Verification status unavailable
                        </p>
                      )}
                    </div>
                  </div>
                </SettingRow>
              </div>
            </section>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                theme === "DARK"
                  ? "border-[#344441] bg-[#1B2926]"
                  : "border-[#122425]/10 bg-white/65"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#122425]/5">
                  <ShieldCheck className="h-5 w-5 text-[#122425]/60" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B48643]">
                    Security
                  </p>

                  <h2 className="mt-2 font-serif text-3xl italic text-[#122425]">
                    Protect your account
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/50">
                    Manage your credentials and review the security of your
                    SOLAÍS account.
                  </p>
                </div>
              </div>

              <SettingRow
                label="Password"
                description="Change the password used to sign in to your SOLAÍS account."
              >
                <button
                  type="button"
                  onClick={() => {
                    setPasswordFormOpen((open) => !open);
                    setPasswordError(null);
                    setPasswordSuccess(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#122425]/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425] transition hover:bg-[#122425]/5"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {passwordFormOpen ? "Cancel" : "Change password"}
                </button>
              </SettingRow>

              {passwordFormOpen && (
                <form
                  onSubmit={handlePasswordChange}
                  className="mt-5 space-y-4 rounded-2xl border border-[#122425]/10 bg-white/80 p-5"
                >
                  <div>
                    <label
                      htmlFor="current-password"
                      className="mb-2 block text-xs font-medium text-[#122425]"
                    >
                      Current password
                    </label>
                    <input
                      id="current-password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A96A]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="mb-2 block text-xs font-medium text-[#122425]"
                    >
                      New password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      className="w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A96A]"
                    />
                    <p className="mt-1 text-[10px] text-[#122425]/45">
                      Use at least 8 characters.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="mb-2 block text-xs font-medium text-[#122425]"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="w-full rounded-xl border border-[#122425]/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A96A]"
                    />
                  </div>

                  {passwordError && (
                    <p role="alert" className="text-sm text-red-700">
                      {passwordError}
                    </p>
                  )}

                  {passwordSuccess && (
                    <p role="status" className="text-sm text-[#55745A]">
                      {passwordSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center rounded-full bg-[#122425] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#EEE8DD] transition hover:bg-[#1B3637] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isChangingPassword ? "Updating…" : "Update password"}
                  </button>
                </form>
              )}
            </section>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                theme === "DARK"
                  ? "border-[#344441] bg-[#1B2926]"
                  : "border-[#122425]/10 bg-white/65"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#122425]/5">
                  <Sun className="h-5 w-5 text-[#122425]/60" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B48643]">
                    Appearance
                  </p>

                  <h2 className="mt-2 font-serif text-3xl italic text-[#122425]">
                    Set your mood
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#122425]/50">
                    Choose how you would like your SOLAÍS experience to appear.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void handleAppearanceChange("LIGHT")}
                  disabled={isSavingAppearance}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    theme === "LIGHT"
                      ? "border-[#C9A96A] bg-[#F5F1E9]"
                      : "border-[#122425]/10 bg-white hover:border-[#122425]/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#122425]/5">
                      <Sun className="h-4 w-4 text-[#122425]/60" />
                    </div>

                    {theme === "LIGHT" && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A96A]/15">
                        <Check className="h-3.5 w-3.5 text-[#B48643]" />
                      </span>
                    )}
                  </div>

                  <p className="mt-5 text-sm font-medium text-[#122425]">
                    Light
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#122425]/45">
                    The current SOLAÍS light experience.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => void handleAppearanceChange("DARK")}
                  disabled={isSavingAppearance}
                  className={`group rounded-2xl border p-5 text-left transition ${
                    theme === "DARK"
                      ? "border-[#C9A96A] bg-[#122425]"
                      : "border-[#122425]/10 bg-[#122425]/3 hover:border-[#122425]/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#122425]/10">
                      <Moon
                        className={`h-4 w-4 ${
                          theme === "DARK"
                            ? "text-[#C9A96A]"
                            : "text-[#122425]/45"
                        }`}
                      />
                    </div>

                    {theme === "DARK" && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A96A]/15">
                        <Check className="h-3.5 w-3.5 text-[#C9A96A]" />
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-5 text-sm font-medium ${
                      theme === "DARK" ? "text-[#EEE8DD]" : "text-[#122425]"
                    }`}
                  >
                    Dark
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      theme === "DARK"
                        ? "text-[#EEE8DD]/45"
                        : "text-[#122425]/45"
                    }`}
                  >
                    A darker visual experience for evening use.
                  </p>
                </button>
              </div>

              <div
                className={`mt-6 rounded-2xl border border-dashed p-5 ${
                  theme === "DARK"
                    ? "border-[#465650] bg-[#23332F]"
                    : "border-[#122425]/15 bg-[#F5F1E9]/70"
                }`}
              >
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#B48643]">
                  Appearance preview
                </p>

                <p className="mt-2 text-sm leading-6 text-[#122425]/55">
                  Your appearance preference is saved to your account and
                  applies to the attendee portal when you navigate between pages
                  or sign in again.
                </p>

                {isSavingAppearance && (
                  <p role="status" className="mt-3 text-sm text-[#122425]/60">
                    Saving appearance preference…
                  </p>
                )}

                {appearanceError && (
                  <p role="alert" className="mt-3 text-sm text-red-700">
                    {appearanceError}
                  </p>
                )}

                {appearanceSuccess && (
                  <p role="status" className="mt-3 text-sm text-[#55745A]">
                    {appearanceSuccess}
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
