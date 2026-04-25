import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "full" | "mark";

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
};

/**
 * Renders the Pasion Balcanica brand mark.
 *
 * `full`  — wordmark + icon (371 × 133.4 viewBox)
 * `mark`  — icon-only swirl (square)
 *
 * Sizing is controlled via Tailwind classes on the wrapper. Width/height are
 * set to intrinsic values so the SVG scales responsively with the container.
 */
export function Logo({
  variant = "full",
  className,
  priority = false,
  alt = "Pasion Balcanica",
}: LogoProps) {
  const isMark = variant === "mark";
  const src = isMark ? "/logo-mark.svg" : "/logo.svg";
  const width = isMark ? 48 : 371;
  const height = isMark ? 48 : 133.4;

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn("select-none", className)}
      draggable={false}
    />
  );
}
