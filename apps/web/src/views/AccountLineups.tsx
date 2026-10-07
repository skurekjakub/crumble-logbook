import { Link } from "@tanstack/react-router";
import type { AccountCookie, AccountLineup, AccountSnapshot } from "../api/types";
import { MODES } from "../app/modes";
import { Clamp } from "../components/Clamp";
import { CookieIcon } from "../components/CookieIcon";
import { compactFigures, figure, humanize } from "../lib/account";
import { shortName } from "../lib/cookie-icons";
import { RefChip } from "./AccountRoadmap";

/** Words a lineup key's short forms stand for. */
const KEY_WORDS: Record<string, string> = { def: "defense", atk: "attack" };

/**
 * A lineup key as a heading: its words spelled out and its first letter
 * upper-cased (`arena_def` → `Arena defense`).
 *
 * @param key - the snapshot's key, e.g. `rumble_atk`
 * @returns the heading
 */
export function keyLabel(key: string): string {
  return humanize(
    key
      .split(/[_-]+/)
      .map((word) => KEY_WORDS[word] ?? word)
      .join(" "),
  );
}

/**
 * Compact chips of one kind (gear, runes, the pet), each marked by the
 * kind's glyph.
 *
 * @param props - the chips and their kind
 * @returns the chips, or null for none
 */
function KitChips({ kind, chips }: { kind: "gear" | "rune" | "pet"; chips: readonly string[] }) {
  if (!chips.length) return null;
  return (
    <>
      {chips.map((chip, i) => (
        <span key={`${kind}-${i}`} className={`chip kit ${kind}`} title={`${kind}: ${chip}`}>
          {chip}
        </span>
      ))}
    </>
  );
}

/**
 * One cookie of a lineup: its portrait with its stars on it (and a crown
 * when it captains the lineup), its short name, its level, skill and
 * promotion as badges, and its gear, runes and pet as compact chips.
 *
 * @param props - the cookie, and whether it is the lineup's captain
 * @returns the cookie's tile
 */
function CookieTile({ cookie: c, captain }: { cookie: AccountCookie; captain: boolean }) {
  const level = figure(c.level, "level");
  const stars = figure(c.stars, "stars");
  const skill = figure(c.skillLevel, "skill");
  const kit = c.gear.length + c.runes.length + (c.pet ? 1 : 0);
  const tip = [c.en ?? c.kr, c.power ? `power ${compactFigures(c.power)}` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className={captain ? "acct-cookie captain" : "acct-cookie"} title={tip}>
      <span className="pic">
        <CookieIcon kr={c.kr} en={c.en} size={40} resourceKey={c.resourceKey} />
        {stars ? <span className="fig stars">{stars}</span> : null}
        {captain ? (
          <span className="fig crown" title="Captain" aria-label="Captain">
            ♛
          </span>
        ) : null}
      </span>
      <span className="body">
        <span className="nm">{c.en ? shortName(c.en) : c.kr}</span>
        <span className="figs">
          {level ? <span className="fig lv">{level}</span> : null}
          {skill ? (
            <span className="fig skill" title="Skill level">
              {skill}
            </span>
          ) : null}
          {c.promotion ? (
            <span className="fig promo" title="Promotion">
              {c.promotion === "max" ? "P max" : `P ${c.promotion}`}
            </span>
          ) : null}
        </span>
      </span>
      {kit ? (
        <span className="chips kits">
          <KitChips kind="gear" chips={c.gear} />
          <KitChips kind="rune" chips={c.runes} />
          <KitChips kind="pet" chips={c.pet ? [c.pet] : []} />
        </span>
      ) : null}
    </li>
  );
}

/**
 * One lineup as a card: its name, power, the mode it plays in and the
 * research deck it matches, its pets and gear preset, then a tile per
 * cookie in formation order (the captain crowned).
 *
 * @param props - the lineup
 * @returns the card
 */
function LineupCard({ lineup }: { lineup: AccountLineup }) {
  const mode = MODES.find((m) => m.scope.mode === lineup.gameMode);
  const captain = lineup.captain;
  return (
    <article className="card acct-lineup">
      <div className="card-head">
        <h4>{lineup.label ?? keyLabel(lineup.lineup)}</h4>
        <span className="chips">
          {lineup.power ? (
            <span className="chip power" title={`Team power ${lineup.power}`}>
              {compactFigures(lineup.power)}
            </span>
          ) : null}
          {mode ? (
            <Link {...mode.link} className="chip mode-link">
              {mode.label} →
            </Link>
          ) : null}
        </span>
      </div>
      {lineup.deck || lineup.pets.length || lineup.gearPreset ? (
        <div className="acct-lineup-meta chips">
          {lineup.deck ? (
            <span className="matches">
              <span className="label">Matches</span> <RefChip target={lineup.deck} />
            </span>
          ) : null}
          {lineup.pets.map((pet, i) => (
            <span
              key={`${i}-${pet.kr}`}
              className="chip pet-chip"
              title={`Pet: ${pet.en ?? pet.kr}`}
            >
              <CookieIcon kr={pet.kr} en={pet.en} size={20} resourceKey={pet.resourceKey} />
              {pet.en ?? pet.kr}
            </span>
          ))}
          {lineup.gearPreset ? (
            <span className="chip kit gear" title={`Gear preset: ${lineup.gearPreset}`}>
              {lineup.gearPreset}
            </span>
          ) : null}
        </div>
      ) : null}
      {lineup.cookies.length ? (
        <ul className="acct-team">
          {lineup.cookies.map((c, i) => (
            <CookieTile
              key={`${i}-${c.name}`}
              cookie={c}
              captain={
                captain !== null &&
                (captain.resourceKey !== null
                  ? captain.resourceKey === c.resourceKey
                  : captain.kr === c.kr)
              }
            />
          ))}
        </ul>
      ) : null}
      {lineup.note ? (
        <span className="acct-note">
          <Clamp lines={1} perLine={80}>
            {lineup.note}
          </Clamp>
        </span>
      ) : null}
    </article>
  );
}

/**
 * The snapshot's lineups, one card per lineup, then its resources as
 * chips and its pets folded under a summary.
 *
 * @param props - the snapshot
 * @returns the lineups and holdings
 */
export function AccountLineups({ snapshot }: { snapshot: AccountSnapshot }) {
  return (
    <>
      <div className="acct-lineups">
        {snapshot.lineups.map((lineup) => (
          <LineupCard key={lineup.id} lineup={lineup} />
        ))}
      </div>
      <AccountHoldings snapshot={snapshot} />
    </>
  );
}

/**
 * The snapshot's resources as chips, and its pets folded under a summary,
 * each pet with its portrait, rarity and stars, its effects in the tooltip.
 *
 * @param props - the snapshot
 * @returns the holdings, or null when the snapshot has none
 */
function AccountHoldings({ snapshot }: { snapshot: AccountSnapshot }) {
  if (!snapshot.pets.length && !snapshot.resources.length) return null;
  return (
    <div className="acct-holdings">
      {snapshot.resources.length ? (
        <div className="acct-row">
          <span className="label">Resources</span>
          <span className="chips">
            {snapshot.resources.map((r) => (
              <span key={r.name} className="chip" title={`${humanize(r.name)}: ${r.value}`}>
                {humanize(r.name)} <b className="mono">{compactFigures(r.value)}</b>
              </span>
            ))}
          </span>
        </div>
      ) : null}
      {snapshot.pets.length ? (
        <details className="acct-pets">
          <summary>
            <span className="label">Pets</span>
          </summary>
          <span className="chips">
            {snapshot.pets.map((pet, i) => (
              <span
                key={`${i}-${pet.name}`}
                className="chip pet-chip"
                title={[pet.en ?? pet.kr, pet.detail].filter(Boolean).join(" — ")}
              >
                <CookieIcon kr={pet.kr} en={pet.en} size={20} resourceKey={pet.resourceKey} />
                {pet.en ?? pet.kr}
                {pet.chips.length ? <span className="muted">{pet.chips.join(" · ")}</span> : null}
              </span>
            ))}
          </span>
        </details>
      ) : null}
    </div>
  );
}

/**
 * What the audit couldn't read, as a quiet chip list.
 *
 * @param props - the lines
 * @returns the list, or null when the audit read everything
 */
export function AccountUnread({ unread }: { unread: readonly string[] }) {
  if (!unread.length) return null;
  return (
    <div className="acct-row acct-unread">
      <span className="label">Couldn't read</span>
      <span className="chips">
        {unread.map((line, i) => (
          <span key={i} className="chip quiet">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
