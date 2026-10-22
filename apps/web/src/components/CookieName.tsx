import { shortName } from "../lib/cookie-icons";
import type { IconSize } from "./CookieIcon";
import { CookieIcon } from "./CookieIcon";

/** Props for {@link CookieName}. */
export interface CookieNameProps {
  /** The name as stored (Korean, or forum shorthand). */
  kr: string;
  /** The glossary's English name, or null when the name is unresolved. */
  en: string | null;
  /** Lay the name out on one line, for inline lists; stacked when off. */
  inline?: boolean;
  /** Show the portrait before the name; on unless turned off. */
  icon?: boolean;
  /** The portrait's size; 28 stacked and 20 inline when omitted. */
  size?: IconSize;
  /**
   * Keep the stored name visible after the English one (beneath it when
   * stacked), for a page about the Korean names themselves.
   */
  showKr?: boolean;
}

/**
 * A cookie or pet name with its portrait: the short English name, with the
 * full English and the stored name in the tooltip. A name with no English
 * shows its stored form, so it never renders blank.
 *
 * @param props - the Korean and English names, the layout, the portrait and whether the Korean shows
 * @returns the name
 */
export function CookieName({
  kr,
  en,
  inline = false,
  icon = true,
  size,
  showKr = false,
}: CookieNameProps) {
  const short = en ? shortName(en) : null;
  const title = en ? `${en} (${kr})` : undefined;
  const pic = icon ? <CookieIcon kr={kr} en={en} size={size ?? (inline ? 20 : 28)} /> : null;
  const krLine = short && showKr ? <span className="kr">{kr}</span> : null;
  if (inline) {
    return (
      <span className="name-inline" title={title}>
        {pic}
        <span>
          {short ?? kr}
          {krLine ? <> {krLine}</> : null}
        </span>
      </span>
    );
  }
  return (
    <span className="name-row" title={title}>
      {pic}
      <span className="name-stack">
        <span className="en">{short ?? kr}</span>
        {krLine}
      </span>
    </span>
  );
}
