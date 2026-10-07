import { createContext, useContext, useState } from "react";
import type { IconIndex } from "../lib/cookie-icons";
import { EMPTY_ICONS, iconSrc, initials, lookupIcon } from "../lib/cookie-icons";

/**
 * The icon index every {@link CookieIcon} reads: the root layout provides
 * it from the glossary, so a name needs no icon prop threaded through the
 * views. Without a provider, every icon is a badge.
 */
export const IconIndexContext = createContext<IconIndex>(EMPTY_ICONS);

/** Icon sizes, in px; each is also the CSS modifier. */
export type IconSize = 20 | 28 | 40 | 56;

/** Props for {@link CookieIcon}. */
export interface CookieIconProps {
  /** The name as stored (Korean, or forum shorthand). */
  kr: string;
  /** The glossary's English name, or null when the name is unresolved. */
  en: string | null;
  /** The icon's size in px; 28 when omitted. */
  size?: IconSize;
}

/**
 * A cookie's or pet's portrait. The glossary's resource key picks the
 * file; a name the glossary doesn't key, or a file that fails to load,
 * shows a badge with the name's initials instead, tinted by the cookie's
 * element when known. Decorative: the name always shows beside it.
 *
 * @param props - the name and the size
 * @returns the portrait image, or the fallback badge
 */
export function CookieIcon({ kr, en, size = 28 }: CookieIconProps) {
  const entry = lookupIcon(useContext(IconIndexContext), kr, en);
  const src = entry?.key ? iconSrc(entry.key) : null;
  const [failed, setFailed] = useState<string | null>(null);
  if (src && failed !== src) {
    return (
      <img
        className={`cicon s${size}`}
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => {
          setFailed(src);
        }}
      />
    );
  }
  return (
    <span
      className={`cicon badge s${size}${entry?.element ? ` el-${entry.element}` : ""}`}
      aria-hidden="true"
      // Drawn by CSS from the attribute, so the badge adds nothing to the name's text content.
      data-initials={initials(en ?? kr)}
    />
  );
}
