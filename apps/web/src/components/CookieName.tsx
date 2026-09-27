/** Props for {@link CookieName}. */
export interface CookieNameProps {
  /** The name as stored (Korean, or forum shorthand). */
  kr: string;
  /** The glossary's English name, or null when the name is unresolved. */
  en: string | null;
  /** Put the Korean after the English on one line instead of beneath it (for inline lists). */
  inline?: boolean;
}

/**
 * A cookie or pet name: English with the Korean beneath it, or the Korean
 * alone when `en` is null.
 */
export function CookieName({ kr, en, inline = false }: CookieNameProps) {
  if (!en) return <>{kr}</>;
  if (inline) {
    return (
      <>
        {en} <span className="kr">{kr}</span>
      </>
    );
  }
  return (
    <span className="name-stack">
      {en}
      <span className="kr">{kr}</span>
    </span>
  );
}
