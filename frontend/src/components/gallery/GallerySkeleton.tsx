interface GallerySkeletonProps {
  count?: number;
}

export function GallerySkeleton({
  count = 8,
}: GallerySkeletonProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-[4/5] animate-pulse bg-neutral-200"
        />
      ))}
    </div>
  );
}
