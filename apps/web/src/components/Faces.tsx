import { shortName } from "../lib/cookie-icons";
import type { FaceRef } from "../lib/deck-names";
import type { IconSize } from "./CookieIcon";
import { CookieIcon } from "./CookieIcon";

/** Props for {@link FaceStack}. */
export interface FaceStackProps {
  /** The cookies that stand for a team, most telling first. */
  faces: readonly FaceRef[];
  /** Each portrait's size; 28 when omitted. */
  size?: IconSize;
}

/**
 * A team's glyph: a few portraits overlapping, the first on top. The names
 * sit in the tooltip, as the team's own name is printed beside it.
 *
 * @param props - the faces and their size
 * @returns the stack, or null with no faces
 */
export function FaceStack({ faces, size = 28 }: FaceStackProps) {
  if (!faces.length) return null;
  const names = faces.map((f) => (f.en ? shortName(f.en) : f.kr)).join(", ");
  return (
    <span className={`faces s${size}`} title={names}>
      {faces.map((f) => (
        <CookieIcon key={f.kr} kr={f.kr} en={f.en} size={size} />
      ))}
    </span>
  );
}

/** Props for {@link MemberChips}. */
export interface MemberChipsProps {
  /** The group's members, in order. */
  members: readonly FaceRef[];
}

/**
 * A group's members (a core, a team, a pet set) as small portrait chips,
 * each with its short English name, or the Korean when it has none; the
 * full names are in each chip's tooltip.
 *
 * @param props - the members
 * @returns the chip list, or null with no members
 */
export function MemberChips({ members }: MemberChipsProps) {
  if (!members.length) return null;
  return (
    <ul className="members">
      {members.map((m, i) => (
        <li key={`${i}-${m.kr}`} title={m.en ? `${m.en} ${m.kr}` : m.kr}>
          <CookieIcon kr={m.kr} en={m.en} size={20} />
          <span>{m.en ? shortName(m.en) : m.kr}</span>
        </li>
      ))}
    </ul>
  );
}
