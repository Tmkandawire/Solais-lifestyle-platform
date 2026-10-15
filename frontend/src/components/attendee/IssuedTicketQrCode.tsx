import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

import { useIssuedTicketQrCredential } from "../../hooks/useIssuedTickets";

interface IssuedTicketQrCodeProps {
  ticketId: string;
  ticketStatus: "ISSUED" | "CHECKED_IN" | "CANCELLED";
}

export default function IssuedTicketQrCode({
  ticketId,
  ticketStatus,
}: IssuedTicketQrCodeProps) {
  const [visible, setVisible] = useState(false);

  const { qrCredential, loading, error, fetchQrCredential, clearQrCredential } =
    useIssuedTicketQrCredential(ticketId);

  const handleToggle = async () => {
    if (visible) {
      setVisible(false);
      clearQrCredential();
      return;
    }

    setVisible(true);

    if (!qrCredential) {
      await fetchQrCredential();
    }
  };

  const unavailable = ticketStatus !== "ISSUED";

  return (
    <section className="mt-6 rounded-xl border border-[#c9a96a]/40 bg-[#c9a96a]/5 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#122425]">
            Admission QR code
          </h3>

          <p className="mt-1 text-xs leading-5 text-[#6d6559]">
            {unavailable
              ? "This ticket is not available for admission."
              : "Show this QR code at the event entrance."}
          </p>
        </div>

        {!unavailable && (
          <button
            type="button"
            onClick={() => void handleToggle()}
            disabled={loading}
            aria-expanded={visible}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#122425]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#122425] transition-colors hover:bg-[#122425]/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : visible ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}

            {loading ? "Loading..." : visible ? "Hide QR code" : "Show QR code"}
          </button>
        )}
      </div>

      {visible && (
        <div className="mt-5">
          {loading && (
            <div
              className="flex min-h-48 items-center justify-center"
              role="status"
            >
              <LoaderCircle size={24} className="animate-spin text-[#b08d50]" />
              <span className="ml-3 text-sm text-[#6d6559]">
                Retrieving your QR code...
              </span>
            </div>
          )}

          {error && !loading && (
            <div role="alert" className="rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => void fetchQrCredential()}
                className="mt-3 text-xs font-semibold uppercase tracking-wider text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {qrCredential && !loading && !error && (
            <div className="flex flex-col items-center rounded-xl bg-white p-5">
              <QRCodeSVG
                value={qrCredential}
                size={220}
                level="M"
                includeMargin
                title={`Admission QR code for ticket ${ticketId}`}
              />

              <p className="mt-4 text-center text-xs leading-5 text-[#6d6559]">
                Keep this code private. Present it to event staff for admission.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
