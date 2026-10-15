import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  Pencil,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";

import { updateAccountProfile } from "../../../api/account.api";
import { parseApiError } from "../../../api/errors";

function getInitials(accountId: string): string {
  return accountId.slice(0, 2).toUpperCase();
}

function formatAccountId(accountId: string): string {
  if (accountId.length <= 16) {
    return accountId;
  }

  return `${accountId.slice(0, 8)}...${accountId.slice(-6)}`;
}

export default function AttendeeProfilePage() {
  const { user, profile, isAuthenticated, updateProfile } = useAuth();
  const { success, error: showError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [formError, setFormError] = useState<string | null>(null);

  const handleCancelEdit = () => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setFormError(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setFormError("First name and last name are required.");
      return;
    }

    if (trimmedFirstName.length > 80 || trimmedLastName.length > 80) {
      setFormError("Each name must be 80 characters or fewer.");
      return;
    }

    if (!profile) {
      setFormError(
        "Your account details could not be loaded. Please refresh and try again.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateAccountProfile({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      });

      const updatedAccount = response.data;

      updateProfile({
        accountId: updatedAccount.id,
        firstName: updatedAccount.firstName,
        lastName: updatedAccount.lastName,
        email: updatedAccount.email,
        role: updatedAccount.role,
        isActive: updatedAccount.isActive,
        emailVerifiedAt: updatedAccount.emailVerifiedAt,
        createdAt: updatedAccount.createdAt,
      });

      setIsEditing(false);

      success("Profile updated", {
        description: "Your personal details have been saved successfully.",
      });
    } catch (error) {
      const { message } = parseApiError(
        error,
        "We couldn't save your profile. Please try again.",
      );
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyAccountId = async () => {
    if (!user) {
      return;
    }

    try {
      await navigator.clipboard.writeText(user.accountId);

      success("Account ID copied", {
        description:
          "Your SOLAÍS account reference has been copied to your clipboard.",
      });
    } catch {
      showError("Unable to copy account ID", {
        description: "Please copy the account reference manually.",
      });
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#12100D] p-8 text-[#EEE8DD] sm:p-10">
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-[#C9A96A]">
            My Account
          </p>

          <h1 className="font-serif text-4xl italic tracking-tight text-[var(--attendee-text)] sm:text-5xl">
            My Account
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#EEE8DD]/60">
            Your account information is not currently available. Please sign in
            again to continue.
          </p>
        </div>
      </div>
    );
  }

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
      : getInitials(user.accountId);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page introduction */}
      <section className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#B48643]">
          SOLAÍS Lifestyle
        </p>

        <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-4xl italic tracking-tight text-[var(--attendee-text)] sm:text-5xl">
              My Account
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--attendee-text-muted)]">
              Manage your SOLAÍS identity and keep track of your account
              details.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--attendee-border)] bg-[var(--attendee-surface)] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#6C8B70]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--attendee-text-muted)]">
              {isAuthenticated ? "Authenticated" : "Not authenticated"}
            </span>
          </div>
        </div>
      </section>

      {/* Profile hero */}
      <section className="overflow-hidden rounded-[2rem] bg-[#12100D] text-[#EEE8DD]">
        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#C9A96A]/10 blur-3xl" />

          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 sm:gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#C9A96A]/40 bg-[#C9A96A]/10 font-serif text-2xl italic text-[#C9A96A] sm:h-24 sm:w-24 sm:text-3xl">
                {initials}
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C9A96A]">
                  Attendee
                </p>

                <h2 className="mt-2 font-serif text-3xl italic sm:text-4xl">
                  Your SOLAÍS account
                </h2>

                <p className="mt-2 text-xs text-[#EEE8DD]/45">
                  Account reference {formatAccountId(user.accountId)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full border border-[#EEE8DD]/10 bg-[#EEE8DD]/5 px-4 py-2 md:self-auto">
              <CheckCircle2 className="h-4 w-4 text-[#C9A96A]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EEE8DD]/70">
                Active account
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Account information */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B48643]">
                Personal information
              </p>

              <h2 className="mt-2 font-serif text-2xl italic text-[var(--attendee-text)] sm:text-3xl">
                Your details
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--attendee-surface-muted)]">
              <UserRound className="h-4 w-4 text-[var(--attendee-text-muted)]" />
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="profile-first-name"
                  className="mb-2 block text-xs font-medium text-[#122425]/70"
                >
                  First name
                </label>
                <input
                  id="profile-first-name"
                  type="text"
                  autoComplete="given-name"
                  maxLength={80}
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] px-4 py-3 text-sm text-[var(--attendee-text)] outline-none transition placeholder:text-[var(--attendee-text-muted)] focus:border-[var(--attendee-accent)] focus:ring-2 focus:ring-[var(--attendee-accent)]/15 disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-last-name"
                  className="mb-2 block text-xs font-medium text-[#122425]/70"
                >
                  Last name
                </label>
                <input
                  id="profile-last-name"
                  type="text"
                  autoComplete="family-name"
                  maxLength={80}
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={isSaving}
                  className="w-full rounded-xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] px-4 py-3 text-sm text-[var(--attendee-text)] outline-none transition placeholder:text-[var(--attendee-text-muted)] focus:border-[var(--attendee-accent)] focus:ring-2 focus:ring-[var(--attendee-accent)]/15 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--attendee-text-muted)]">
                  Email address
                </label>
                <p className="rounded-xl border border-[var(--attendee-border)] bg-[var(--attendee-surface-muted)] px-4 py-3 text-sm text-[var(--attendee-text-muted)]">
                  {profile?.email ?? "Not available"}
                </p>
                <p className="mt-2 text-xs leading-5 text-[var(--attendee-text-muted)]">
                  Email address changes are not available here.
                </p>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--attendee-border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--attendee-text-muted)] transition hover:bg-[var(--attendee-surface-muted)] disabled:opacity-60"
                >
                  {isSaving && (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  )}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--attendee-border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--attendee-text-muted)] transition hover:bg-[var(--attendee-surface-muted)] disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface-muted)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--attendee-text-muted)]">
                  First name
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--attendee-text)]">
                  {profile?.firstName || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface-muted)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--attendee-text-muted)]">
                  Last name
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--attendee-text)]">
                  {profile?.lastName || "Not available"}
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--attendee-border)] bg-[var(--attendee-surface-muted)] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--attendee-text-muted)]">
                  Email address
                </p>
                <p className="mt-2 break-all text-sm font-medium text-[var(--attendee-text)]">
                  {profile?.email || "Not available"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFirstName(profile?.firstName ?? "");
                  setLastName(profile?.lastName ?? "");
                  setFormError(null);
                  setIsEditing(true);
                }}
                disabled={!profile}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--attendee-border)] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--attendee-text)] transition hover:border-[var(--attendee-accent)] hover:bg-[var(--attendee-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </button>
            </div>
          )}
        </div>

        {/* Account status */}
        <div className="rounded-3xl bg-[#122425] p-6 text-[#EEE8DD] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C9A96A]">
            Account status
          </p>

          <h2 className="mt-2 font-serif text-2xl italic sm:text-3xl">
            Account security
          </h2>

          <div className="mt-8 space-y-5">
            <div className="rounded-2xl border border-[#EEE8DD]/10 bg-[#EEE8DD]/5 p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C9A96A]/10">
                  <ShieldCheck className="h-4 w-4 text-[#C9A96A]" />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">Authenticated session</p>

                    <span className="rounded-full border border-[#6C8B70]/20 bg-[#6C8B70]/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#A9C0AC]">
                      Active
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#EEE8DD]/45">
                    Your current session is authenticated through the SOLAÍS
                    account system.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEE8DD]/5">
                <Clock3 className="h-4 w-4 text-[#C9A96A]" />
              </div>

              <div>
                <p className="text-sm font-medium">Session protected</p>

                <p className="mt-1 text-xs leading-5 text-[#EEE8DD]/45">
                  Access is managed through a short-lived authenticated session
                  with backend refresh handling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account reference */}
      <section className="mt-6 rounded-3xl border border-[var(--attendee-border)] bg-[var(--attendee-surface)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B48643]">
              Account reference
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="font-mono text-xs text-[var(--attendee-text-muted)]">
                {user.accountId}
              </p>

              <button
                type="button"
                onClick={handleCopyAccountId}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-[#122425]/10 bg-white/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/65 transition hover:border-[#B48643]/30 hover:bg-white hover:text-[#122425]"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy ID
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--attendee-text-muted)]">
              Account role
            </p>

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--attendee-text)]">
              {user.role}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
