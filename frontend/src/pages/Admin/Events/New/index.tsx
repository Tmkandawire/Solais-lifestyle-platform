import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Image,
  MapPin,
  Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useCreateEvent } from "../../../../hooks/useAdminEvent";
import { useToast } from "../../../../hooks/useToast";
import type { CreateEventPayload } from "../../../../types/event";

interface EventFormState {
  title: string;
  description: string;
  venue: string;
  city: string;
  startDate: string;
  endDate: string;
  bannerImageUrl: string;
  capacity: string;
}

const initialFormState: EventFormState = {
  title: "",
  description: "",
  venue: "",
  city: "",
  startDate: "",
  endDate: "",
  bannerImageUrl: "",
  capacity: "",
};

function toDateTimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);

  return localDate.toISOString().slice(0, 16);
}

const inputClassName =
  "h-12 w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 text-sm text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/70 focus:bg-white focus:ring-4 focus:ring-[#c99b55]/8";

const textareaClassName =
  "w-full resize-y rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm leading-6 text-[#122425] outline-none transition placeholder:text-[#122425]/30 focus:border-[#c99b55]/70 focus:bg-white focus:ring-4 focus:ring-[#c99b55]/8";

const labelClassName =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#122425]/65";

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon?: typeof MapPin;
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-[#122425]/8 px-6 py-5 sm:px-7">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5f1e9] text-[#c99b55]">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
        )}

        <div>
          {eyebrow && (
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#c99b55]">
              {eyebrow}
            </p>
          )}

          <h2 className="font-serif text-xl italic text-[#122425]">{title}</h2>

          <p className="mt-1 text-sm leading-6 text-[#122425]/45">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminCreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { create, isLoading, error } = useCreateEvent();

  const [form, setForm] = useState<EventFormState>(initialFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateField<K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (validationError) {
      setValidationError(null);
    }
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Event title is required.";
    }

    if (!form.description.trim()) {
      return "Event description is required.";
    }

    if (!form.venue.trim()) {
      return "Venue is required.";
    }

    if (!form.city.trim()) {
      return "City is required.";
    }

    if (!form.startDate) {
      return "Start date and time are required.";
    }

    if (!form.endDate) {
      return "End date and time are required.";
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (Number.isNaN(startDate.getTime())) {
      return "Please provide a valid start date and time.";
    }

    if (Number.isNaN(endDate.getTime())) {
      return "Please provide a valid end date and time.";
    }

    if (endDate <= startDate) {
      return "End date and time must be after the start date and time.";
    }

    if (form.capacity.trim()) {
      const capacity = Number(form.capacity);

      if (!Number.isInteger(capacity) || capacity <= 0) {
        return "Capacity must be a positive whole number.";
      }
    }

    if (form.bannerImageUrl.trim()) {
      try {
        new URL(form.bannerImageUrl.trim());
      } catch {
        return "Banner image URL must be a valid URL.";
      }
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setValidationError(validationMessage);
      return;
    }

    const payload: CreateEventPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      venue: form.venue.trim(),
      city: form.city.trim(),
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      ...(form.bannerImageUrl.trim()
        ? { bannerImageUrl: form.bannerImageUrl.trim() }
        : {}),
      ...(form.capacity.trim() ? { capacity: Number(form.capacity) } : {}),
    };

    try {
      await create(payload);

      toast.success("Event created successfully.", {
        description: "The event has been saved as a draft.",
      });

      navigate("/admin/events");
    } catch {
      // The hook exposes the error state.
    }
  }

  const minimumStartDate = toDateTimeLocalValue(new Date());

  return (
    <div className="mx-auto max-w-5xl">
      {/* Page header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/events")}
          className="group mb-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/45 transition hover:text-[#122425]"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.5}
          />
          Back to events
        </button>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#c99b55]">
              Event management
            </p>

            <h1 className="font-serif text-4xl italic tracking-tight text-[#122425] sm:text-5xl">
              Create event
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#122425]/50">
              Create a new SOLAÍS experience. New events are saved as drafts
              until they are published.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#122425]/8 bg-white px-4 py-2.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c99b55]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#122425]/50">
              Draft on creation
            </span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {(validationError || error) && (
        <section className="mb-6 rounded-2xl border border-[#a84b45]/20 bg-[#a84b45]/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a84b45]/10 text-[#a84b45]">
              <span className="text-sm font-semibold">!</span>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#8f3f39]">
                Unable to create event
              </p>

              <p className="mt-1 text-sm leading-6 text-[#a84b45]/75">
                {validationError ?? error}
              </p>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.035)]">
          <SectionHeader
            eyebrow="01"
            title="Basic information"
            description="Provide the core details attendees will see."
          />

          <div className="space-y-6 p-6 sm:p-7">
            <div>
              <label htmlFor="event-title" className={labelClassName}>
                Event title
              </label>

              <input
                id="event-title"
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={200}
                required
                placeholder="e.g. SOLAÍS Summer Experience"
                className={inputClassName}
              />

              <div className="mt-2 flex justify-end">
                <p className="text-[10px] tracking-wide text-[#122425]/30">
                  {form.title.length}/200
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="event-description" className={labelClassName}>
                Description
              </label>

              <textarea
                id="event-description"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                maxLength={5000}
                required
                rows={6}
                placeholder="Describe the event, experience and what attendees can expect..."
                className={textareaClassName}
              />

              <div className="mt-2 flex justify-end">
                <p className="text-[10px] tracking-wide text-[#122425]/30">
                  {form.description.length}/5000
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.035)]">
          <SectionHeader
            icon={MapPin}
            eyebrow="02"
            title="Location"
            description="Where will the event take place?"
          />

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
            <div>
              <label htmlFor="event-venue" className={labelClassName}>
                Venue
              </label>

              <input
                id="event-venue"
                type="text"
                value={form.venue}
                onChange={(event) => updateField("venue", event.target.value)}
                maxLength={255}
                required
                placeholder="e.g. Bingu International Convention Centre"
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="event-city" className={labelClassName}>
                City
              </label>

              <input
                id="event-city"
                type="text"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                maxLength={100}
                required
                placeholder="e.g. Lilongwe"
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.035)]">
          <SectionHeader
            icon={CalendarDays}
            eyebrow="03"
            title="Schedule"
            description="Set when the event begins and ends."
          />

          <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-7">
            <div>
              <label htmlFor="event-start" className={labelClassName}>
                Start date & time
              </label>

              <input
                id="event-start"
                type="datetime-local"
                value={form.startDate}
                onChange={(event) =>
                  updateField("startDate", event.target.value)
                }
                min={minimumStartDate}
                required
                className={inputClassName}
              />
            </div>

            <div>
              <label htmlFor="event-end" className={labelClassName}>
                End date & time
              </label>

              <input
                id="event-end"
                type="datetime-local"
                value={form.endDate}
                onChange={(event) => updateField("endDate", event.target.value)}
                min={form.startDate || minimumStartDate}
                required
                className={inputClassName}
              />
            </div>
          </div>
        </section>

        {/* Capacity & media */}
        <section className="overflow-hidden rounded-2xl border border-[#122425]/8 bg-white shadow-[0_12px_40px_rgba(18,36,37,0.035)]">
          <SectionHeader
            icon={Image}
            eyebrow="04"
            title="Capacity & media"
            description="Configure the optional attendance limit and event banner."
          />

          <div className="space-y-6 p-6 sm:p-7">
            <div>
              <label htmlFor="event-capacity" className={labelClassName}>
                Capacity
              </label>

              <input
                id="event-capacity"
                type="number"
                value={form.capacity}
                onChange={(event) =>
                  updateField("capacity", event.target.value)
                }
                min={1}
                step={1}
                placeholder="Leave blank for unlimited"
                className={inputClassName}
              />

              <p className="mt-2 text-xs leading-5 text-[#122425]/35">
                Leave blank if the event does not have a fixed capacity.
              </p>
            </div>

            <div>
              <label htmlFor="event-banner" className={labelClassName}>
                Banner image URL
              </label>

              <div className="relative">
                <Image
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#122425]/30"
                  strokeWidth={1.5}
                />

                <input
                  id="event-banner"
                  type="url"
                  value={form.bannerImageUrl}
                  onChange={(event) =>
                    updateField("bannerImageUrl", event.target.value)
                  }
                  placeholder="https://example.com/event-banner.jpg"
                  className={`${inputClassName} pl-11`}
                />
              </div>

              <p className="mt-2 text-xs leading-5 text-[#122425]/35">
                Optional. Upload/media management integration can be added
                separately when that workflow is implemented.
              </p>

              {form.bannerImageUrl.trim() && (
                <div className="mt-4 overflow-hidden rounded-xl border border-[#122425]/8 bg-[#f5f1e9]">
                  <img
                    src={form.bannerImageUrl.trim()}
                    alt="Event banner preview"
                    className="h-48 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[#122425]/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-[#122425]/40">
            <CheckCircle2
              className="h-4 w-4 text-[#c99b55]"
              strokeWidth={1.5}
            />
            <span>Your event will be created as a draft.</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#122425]/10 bg-white px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#122425]/65 transition hover:border-[#122425]/20 hover:bg-[#faf8f4] hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#122425] px-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#eee5d7] shadow-[0_8px_24px_rgba(18,36,37,0.14)] transition hover:bg-[#1a3031] hover:shadow-[0_10px_28px_rgba(18,36,37,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" strokeWidth={1.6} />

              {isLoading ? "Creating event..." : "Create event"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
