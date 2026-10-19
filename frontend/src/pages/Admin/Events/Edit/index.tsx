import { type FormEvent, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Image,
  MapPin,
  Save,
  Upload,
} from "lucide-react";

import { uploadGalleryMedia } from "../../../../api/gallery.api";

import { useNavigate, useParams } from "react-router-dom";

import { useAdminEvent, useUpdateEvent } from "../../../../hooks/useAdminEvent";
import { useToast } from "../../../../hooks/useToast";
import type { AdminEvent, UpdateEventPayload } from "../../../../types/event";

function toDateTimeLocal(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIsoDate(value: string) {
  return new Date(value).toISOString();
}

function getStatusLabel(status: AdminEvent["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "Published";
    case "CANCELLED":
      return "Cancelled";
    case "COMPLETED":
      return "Completed";
    case "DRAFT":
    default:
      return "Draft";
  }
}

function getStatusClasses(status: AdminEvent["status"]) {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-600/20 bg-emerald-50 text-emerald-700";

    case "CANCELLED":
      return "border-red-600/20 bg-red-50 text-red-700";

    case "COMPLETED":
      return "border-[#122425]/10 bg-[#122425]/5 text-[#122425]/65";

    case "DRAFT":
    default:
      return "border-[#c99b55]/30 bg-[#c99b55]/10 text-[#806238]";
  }
}

interface EditEventFormProps {
  event: AdminEvent;
}

function EditEventForm({ event }: EditEventFormProps) {
  const navigate = useNavigate();
  const { update, isLoading } = useUpdateEvent();
  const { toast } = useToast();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description);
  const [venue, setVenue] = useState(event.venue);
  const [city, setCity] = useState(event.city);
  const [startDate, setStartDate] = useState(toDateTimeLocal(event.startDate));
  const [endDate, setEndDate] = useState(toDateTimeLocal(event.endDate));
  const [bannerImageUrl, setBannerImageUrl] = useState(
    event.bannerImageUrl ?? "",
  );

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const [capacity, setCapacity] = useState(
    event.capacity === null ? "" : String(event.capacity),
  );

  async function handleBannerUpload(file: File | undefined): Promise<void> {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image.");
      return;
    }

    setIsUploadingBanner(true);

    try {
      const uploaded = await uploadGalleryMedia(file);

      if (uploaded.mediaType !== "IMAGE") {
        toast.error("The uploaded file must be an image.");
        return;
      }

      setBannerImageUrl(uploaded.mediaUrl);
      toast.success("Banner image uploaded successfully.");
    } catch {
      toast.error("Failed to upload the banner image. Please try again.");
    } finally {
      setIsUploadingBanner(false);

      if (bannerFileInputRef.current) {
        bannerFileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedVenue = venue.trim();
    const trimmedCity = city.trim();
    const trimmedBannerImageUrl = bannerImageUrl.trim();

    if (!trimmedTitle) {
      toast.error("Please enter an event title.");
      return;
    }

    if (!trimmedDescription) {
      toast.error("Please enter an event description.");
      return;
    }

    if (!trimmedVenue) {
      toast.error("Please enter a venue.");
      return;
    }

    if (!trimmedCity) {
      toast.error("Please enter a city.");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please provide both the start and end date/time.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error("Please provide valid event dates.");
      return;
    }

    if (end <= start) {
      toast.error("The end date/time must be after the start date/time.");
      return;
    }

    let parsedCapacity: number | null = null;

    if (capacity.trim()) {
      const numericCapacity = Number(capacity);

      if (!Number.isInteger(numericCapacity) || numericCapacity <= 0) {
        toast.error("Capacity must be a positive whole number.");
        return;
      }

      parsedCapacity = numericCapacity;
    }

    if (trimmedBannerImageUrl) {
      try {
        new URL(trimmedBannerImageUrl);
      } catch {
        toast.error("Please provide a valid banner image URL.");
        return;
      }
    }

    const payload: UpdateEventPayload = {
      title: trimmedTitle,
      description: trimmedDescription,
      venue: trimmedVenue,
      city: trimmedCity,
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      bannerImageUrl: trimmedBannerImageUrl || null,
      capacity: parsedCapacity,
    };

    try {
      await update(event.id, payload);

      toast.success("Event updated successfully.");

      navigate(`/admin/events/${event.id}`);
    } catch {
      toast.error("Failed to update event. Please try again.");
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/admin/events/${event.id}`)}
            className="mb-4 inline-flex items-center gap-2 text-xs font-medium text-[#122425]/50 transition-colors hover:text-[#122425]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back to event
          </button>

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c99b55]">
            Event management
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#122425]">
            Edit event
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#122425]/50">
            Update the event details below. Lifecycle status is managed
            separately.
          </p>
        </div>

        <span
          className={[
            "inline-flex w-fit items-center rounded-full border px-3.5 py-1.5",
            "text-[9px] font-semibold uppercase tracking-[0.18em]",
            getStatusClasses(event.status),
          ].join(" ")}
        >
          {getStatusLabel(event.status)}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information */}
        <section className="rounded-2xl border border-[#122425]/8 bg-white p-6 shadow-[0_10px_30px_rgba(18,36,37,0.04)] sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c99b55]/10">
              <CalendarDays
                className="h-5 w-5 text-[#c99b55]"
                strokeWidth={1.5}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#122425]">
                Event details
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#122425]/45">
                Keep the event information clear and accurate for attendees.
              </p>
            </div>
          </div>

          <div className="mt-7 space-y-5">
            {/* Title */}
            <div>
              <label
                htmlFor="event-title"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
              >
                Event title
              </label>

              <input
                id="event-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                placeholder="Enter event title"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="event-description"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
              >
                Description
              </label>

              <textarea
                id="event-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                rows={6}
                className="w-full resize-y rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm leading-6 text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                placeholder="Describe the event"
              />
            </div>

            {/* Venue + City */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="event-venue"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
                >
                  Venue
                </label>

                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c99b55]"
                    strokeWidth={1.5}
                  />

                  <input
                    id="event-venue"
                    type="text"
                    value={venue}
                    onChange={(event) => setVenue(event.target.value)}
                    maxLength={255}
                    className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] py-3.5 pl-11 pr-4 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                    placeholder="Venue name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-city"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
                >
                  City
                </label>

                <input
                  id="event-city"
                  type="text"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  maxLength={100}
                  className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                  placeholder="City"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="event-start"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
                >
                  Starts
                </label>

                <input
                  id="event-start"
                  type="datetime-local"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="event-end"
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
                >
                  Ends
                </label>

                <input
                  id="event-end"
                  type="datetime-local"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Ticketing / presentation */}
        <section className="rounded-2xl border border-[#122425]/8 bg-white p-6 shadow-[0_10px_30px_rgba(18,36,37,0.04)] sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c99b55]/10">
              <Image className="h-5 w-5 text-[#c99b55]" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#122425]">
                Presentation & capacity
              </h2>

              <p className="mt-1 text-xs leading-5 text-[#122425]/45">
                Configure the event banner and attendance limit.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {/* Banner */}
            <div>
              <label
                htmlFor="event-banner"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
              >
                Banner image URL
              </label>

              <input
                id="event-banner"
                type="url"
                value={bannerImageUrl}
                onChange={(event) => setBannerImageUrl(event.target.value)}
                className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                placeholder="https://..."
              />

              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  void handleBannerUpload(event.target.files?.[0]);
                }}
              />

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  disabled={isUploadingBanner || isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#122425]/15 px-4 py-2.5 text-xs font-semibold text-[#122425] transition hover:bg-[#122425]/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" strokeWidth={1.5} />
                  {isUploadingBanner
                    ? "Uploading image..."
                    : "Upload banner image"}
                </button>

                <p className="text-[10px] leading-5 text-[#122425]/45">
                  Upload a JPG, PNG, or WebP image, or enter a URL manually.
                </p>
              </div>

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Leave empty to remove the current banner image.
              </p>
            </div>

            {/* Capacity */}
            <div>
              <label
                htmlFor="event-capacity"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#122425]/50"
              >
                Capacity
              </label>

              <input
                id="event-capacity"
                type="number"
                min="1"
                step="1"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                className="w-full rounded-xl border border-[#122425]/10 bg-[#faf8f4] px-4 py-3.5 text-sm text-[#122425] outline-none transition focus:border-[#c99b55]/60 focus:bg-white"
                placeholder="Unlimited"
              />

              <p className="mt-2 text-[10px] leading-5 text-[#122425]/35">
                Leave empty for unlimited capacity.
              </p>
            </div>
          </div>

          {bannerImageUrl.trim() && (
            <div className="mt-6 overflow-hidden rounded-xl border border-[#122425]/8 bg-[#faf8f4]">
              <img
                src={bannerImageUrl}
                alt="Event banner preview"
                className="aspect-[16/6] w-full object-cover"
              />
            </div>
          )}
        </section>

        {/* Lifecycle notice */}
        <section className="rounded-2xl border border-[#c99b55]/20 bg-[#c99b55]/6 px-5 py-4">
          <p className="text-xs font-medium text-[#806238]">
            Event status is currently{" "}
            <span className="font-semibold">
              {getStatusLabel(event.status)}
            </span>
            .
          </p>

          <p className="mt-1 text-[11px] leading-5 text-[#122425]/45">
            Publishing, completing, cancelling and deleting are handled from the
            event management actions.
          </p>
        </section>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(`/admin/events/${event.id}`)}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl border border-[#122425]/10 bg-white px-5 py-3 text-xs font-semibold text-[#122425]/65 transition hover:border-[#122425]/20 hover:text-[#122425] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Discard changes
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#122425] px-6 py-3 text-xs font-semibold text-[#f3eee5] shadow-sm transition hover:bg-[#1b3334] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" strokeWidth={1.6} />

            {isLoading ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminEditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { event, isLoading, error } = useAdminEvent(id);

  if (!id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#122425]">
            Event not found
          </h1>

          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="mt-4 text-xs font-semibold text-[#a8793f] hover:underline"
          >
            Return to events
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 animate-pulse rounded-2xl bg-white" />

        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
          <div className="h-48 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-[#122425]">
            Unable to load event
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#122425]/50">
            {error ?? "The requested event could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#122425] px-5 py-3 text-xs font-semibold text-[#f3eee5]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back to events
          </button>
        </div>
      </div>
    );
  }

  if (event.status === "CANCELLED" || event.status === "COMPLETED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <span
            className={[
              "inline-flex rounded-full border px-3 py-1.5",
              "text-[9px] font-semibold uppercase tracking-[0.18em]",
              getStatusClasses(event.status),
            ].join(" ")}
          >
            {getStatusLabel(event.status)}
          </span>

          <h1 className="mt-5 text-2xl font-semibold text-[#122425]">
            This event cannot be edited
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#122425]/50">
            {event.status === "CANCELLED"
              ? "Cancelled events cannot be modified."
              : "Completed events cannot be modified."}
          </p>

          <button
            type="button"
            onClick={() => navigate(`/admin/events/${event.id}`)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#122425] px-5 py-3 text-xs font-semibold text-[#f3eee5]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back to event
          </button>
        </div>
      </div>
    );
  }

  return <EditEventForm key={event.id} event={event} />;
}
