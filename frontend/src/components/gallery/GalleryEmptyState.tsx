interface GalleryEmptyStateProps {
  title?: string;
  message?: string;
}

export function GalleryEmptyState({
  title = "Nothing to see yet",
  message = "We're preparing something beautiful. Check back soon.",
}: GalleryEmptyStateProps): React.JSX.Element {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-3xl">{title}</h2>

      <p className="mt-3 max-w-md text-sm text-neutral-500">{message}</p>
    </div>
  );
}
