"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ShotFrameProps = {
  /**
   * Product screenshot under /public. Drop the file in and it appears; until
   * then (or if it 404s) the gradient placeholder below is what renders, so a
   * missing shot never shows as a broken image.
   */
  src?: string;
  /** Described for screen readers whether the shot or the gradient shows. */
  alt: string;
  /** Gradient classes used while there is no screenshot. */
  placeholderClassName?: string;
  /** Crop anchor — wide screenshots in tall frames usually want "left top". */
  position?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Wash at the bottom of the shot, where text is laid over it.
   * "dark" for white text (dark in both themes); "page" tints toward the page
   * background so `text-ink` stays readable in light and dark alike.
   */
  scrim?: "dark" | "page" | false;
  className?: string;
};

/**
 * Fills its (positioned) parent with a product screenshot, falling back to the
 * page's abstract gradient. One component behind every marketing visual so the
 * landing page can be wired up before the screenshots exist.
 */
export function ShotFrame({
  src,
  alt,
  placeholderClassName = "placeholder-surface grain",
  position = "left top",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  scrim = false,
  className,
}: ShotFrameProps) {
  const [failed, setFailed] = useState(false);
  const showShot = Boolean(src) && !failed;

  if (!showShot) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("absolute inset-0 -z-10", placeholderClassName, className)}
      />
    );
  }

  return (
    <span className={cn("absolute inset-0 -z-10 block overflow-hidden", className)}>
      <Image
        src={src as string}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        style={{ objectFit: "cover", objectPosition: position }}
      />
      {scrim ? (
        // Keeps text laid over the shot legible whatever the shot looks like.
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            scrim === "dark"
              ? "from-black/65 via-black/20 to-transparent"
              : "from-bg via-bg/55 to-transparent",
          )}
        />
      ) : null}
    </span>
  );
}

export default ShotFrame;
