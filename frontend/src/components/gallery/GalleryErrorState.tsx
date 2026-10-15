interface GalleryErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function GalleryErrorState({
  message = "We couldn't load the gallery.",
  onRetry,
}: GalleryErrorStateProps): React.JSX.Element {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-3xl">Something went wrong</h2>

      <p className="mt-3 max-w-md text-sm text-neutral-500">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 border border-current px-6 py-3 text-sm font-medium transition-opacity hover:opacity-60"
        >
          Try again
        </button>
      )}
    </div>
  );
}
