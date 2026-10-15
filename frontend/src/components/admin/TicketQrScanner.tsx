import { useCallback, useEffect, useRef, type ComponentProps } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

type ScannerProps = ComponentProps<typeof Scanner>;
type ScanHandler = ScannerProps["onScan"];

/**
 * After the scanner resumes, ignore detections for a short moment so a QR code
 * that is still in front of the lens is not scanned a second time.
 */
const RESUME_COOLDOWN_MS = 1500;

/*
 * These options are module-level constants on purpose. Scanner receives new
 * object identities on every render otherwise, which risks restarting the
 * camera whenever the parent page re-renders.
 */
const SCANNER_FORMATS: ScannerProps["formats"] = ["qr_code"];

const SCANNER_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "environment",
};

const SCANNER_COMPONENTS: ScannerProps["components"] = {
  finder: true,
  torch: true,
  zoom: true,
};

const SCANNER_STYLES: ScannerProps["styles"] = {
  container: {
    width: "100%",
    aspectRatio: "1 / 1",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
};

/*
 * The library gives the camera 3 seconds to start by default, which is short
 * for budget phones in the field and produces a false "camera error".
 */
const CAMERA_START_TIMEOUT_MS = 10000;

interface TicketQrScannerProps {
  /** Pauses scanning and dims the camera. Controlled by the parent page. */
  paused: boolean;
  /** Changing this value remounts the scanner. Use it to retry after a camera error. */
  attempt: number;
  /** Receives the raw text of the first QR code detected. */
  onScan: (qrPayload: string) => void;
  /** Receives camera start-up failures (permission denied, no camera, etc.). */
  onCameraError: (error: unknown) => void;
}

/**
 * Camera QR reader.
 *
 * Deliberately narrow: it reports raw QR text and camera errors, and nothing
 * else. Verification, event scoping and result handling live in the page.
 */
export default function TicketQrScanner({
  paused,
  attempt,
  onScan,
  onCameraError,
}: TicketQrScannerProps) {
  const cooldownUntil = useRef(0);

  useEffect(() => {
    if (!paused) {
      cooldownUntil.current = Date.now() + RESUME_COOLDOWN_MS;
    }
  }, [paused]);

  const handleScan = useCallback<ScanHandler>(
    (detectedCodes) => {
      if (paused || Date.now() < cooldownUntil.current) {
        return;
      }

      const rawValue = detectedCodes[0]?.rawValue;

      if (!rawValue) {
        return;
      }

      onScan(rawValue);
    },
    [paused, onScan],
  );

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#122425] shadow-[0_12px_40px_rgba(18,36,37,0.12)]">
      <Scanner
        key={attempt}
        onScan={handleScan}
        onError={onCameraError}
        paused={paused}
        formats={SCANNER_FORMATS}
        constraints={SCANNER_CONSTRAINTS}
        components={SCANNER_COMPONENTS}
        styles={SCANNER_STYLES}
        sound={false}
        allowMultiple
        startTimeoutMs={CAMERA_START_TIMEOUT_MS}
      />

      {paused && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#122425]/45"
        />
      )}
    </div>
  );
}
