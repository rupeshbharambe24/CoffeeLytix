import { cn } from "@/lib/utils";

/**
 * Thin wrapper over a native <img> for user-uploaded Firebase Storage photos.
 * We deliberately avoid next/image here so the app stays offline-friendly and
 * doesn't require remote-pattern config / the optimizer for cached blobs.
 */
export function Photo({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", className)}
    />
  );
}
