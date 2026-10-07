import { shortName } from "../lib/cookie-icons";
import type { IconSize } from "./CookieIcon";
import { CookieIcon } from "./CookieIcon";

/** Props for {@link CookieName}. */
export interface CookieNameProps {
  /** The name as stored (Korean, or forum shorthand). */
  kr: string;
  /** The glossary's English name, or null when the name is unresolved. */
  en: string | null;
  /** Put the Korean after the English on one line instead of beneath it (for inline lists). */
  inline?: boolean;
  /** Show the portrait before the name; on unless turned off. */
  icon?: boolean;
  /** The portrait's size; 28 stacked and 20 inline when omitted. */
  size?: IconSize;
}

/**
 * A cookie or pet name with its portrait: the short English name (the full
 * one in the tooltip) with the Korean beneath it, or the Korean alone when
 * `en` is null.
 *
 * @param props - the Korean and English names, the layout, and the portrait's size
 * @returns the name
 */
export function CookieName({ kr, en, inline = false, icon = true, size }: CookieNameProps) {
  const short = en ? shortName(en) : null;
  const pic = icon ? <CookieIcon kr={kr} en={en} size={size ?? (inline ? 20 : 28)} /> : null;
  if (inline) {
    return (
      <span className="name-inline" title={en ?? undefined}>
        {pic}
        <span>
          {short ?? kr}
          {short ? (
            <>
              {" "}
              <span className="kr">{kr}</span>
            </>
          ) : null}
        </span>
      </span>
    );
  }
  return (
    <span className="name-row" title={en ?? undefined}>
      {pic}
      <span className="name-stack">
        <span className="en">{short ?? kr}</span>
        {short ? <span className="kr">{kr}</span> : null}
      </span>
    </span>
  );
}
