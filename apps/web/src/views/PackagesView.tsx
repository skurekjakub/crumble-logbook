import { useSourceIndex } from "../api/hooks";
import type { PriceTier, ShopPackage } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import { Clamp } from "../components/Clamp";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import type { PillKind } from "../components/Pill";
import { Pill } from "../components/Pill";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { sourceLabel } from "../lib/sources";
import type { PackageVerdict } from "../lib/team-power";
import { byVerdict, formatKrw, formatUsd, packageVerdict, usdPrice } from "../lib/team-power";
import type { TeamPowerData } from "./TeamPowerData";
import { TeamPowerLoaded, useTeamPowerData } from "./TeamPowerData";
import { PowerSourceLink } from "./TeamPowerParts";

/** Labels per spender tier, in select order. */
const TIERS: Readonly<Record<ShopPackage["tier"], string>> = {
  light: "Light spender",
  medium: "Medium spender",
  whale: "Heavy spender",
  none: "No spender",
};

/** Short labels per spender tier, for the table's column. */
const SPENDERS: Readonly<Record<ShopPackage["tier"], string>> = {
  light: "Light",
  medium: "Medium",
  whale: "Heavy",
  none: "None",
};

/** The packages page's search params: a spender tier and a text filter. */
export interface PackagesSearch {
  tier?: ShopPackage["tier"];
  q?: string;
}

/**
 * Reads the packages page's search params.
 *
 * @param search - the decoded query values
 * @returns the tier and the text filter, each dropped when unusable
 */
export function validatePackagesSearch(search: Record<string, unknown>): PackagesSearch {
  return { tier: optionalKey(search.tier, TIERS), q: optionalText(search.q) };
}

/**
 * The texts a package's price shows: KRW; USD as a store lists it, as its
 * price tier (≈) or "USD not listed"; and where the USD figure comes from.
 *
 * @param pack - the package
 * @returns the texts
 */
function priceTexts(pack: ShopPackage): { krw: string; usd: string; from: string } {
  return {
    krw: formatKrw(pack.priceKrw),
    usd: usdPrice(pack)?.text ?? "USD not listed",
    from: pack.usdSource,
  };
}

/**
 * A package's Crystal value as its column shows it.
 *
 * @param pack - the package
 * @returns the text, a dash when it has none
 */
function crystalText(pack: ShopPackage): string {
  if (pack.crystalValuePct === null) return "–";
  const basis = pack.crystalValueBasis ? ` over ${pack.crystalValueBasis}` : "";
  return `${pack.crystalValuePct.toLocaleString("en-US")}%${basis}`;
}

/** The pill and label each package verdict shows. */
const VERDICTS: Readonly<Record<PackageVerdict, readonly [PillKind, string]>> = {
  buy: ["good", "Buy"],
  skip: ["avoid", "Skip"],
  depends: ["niche", "Depends"],
};

/**
 * A package's verdict label, for the text filter.
 *
 * @param pack - the package
 * @returns "Buy", "Skip" or "Depends", or "" when the record's words give none
 */
function verdictLabel(pack: ShopPackage): string {
  const verdict = packageVerdict(pack.verdict);
  return verdict ? VERDICTS[verdict][1] : "";
}

/**
 * A package's verdict as a pill read from the record's words (see
 * {@link packageVerdict}); a quiet dash when they give none.
 *
 * @param props - the package
 * @returns the pill, or the dash
 */
function VerdictPill({ pack }: { pack: ShopPackage }) {
  const verdict = packageVerdict(pack.verdict);
  if (!verdict) return <span className="muted">–</span>;
  const [kind, label] = VERDICTS[verdict];
  return <Pill kind={kind}>{label}</Pill>;
}

/**
 * A package's price as short figures: KRW, then USD as a store lists it
 * or as its price tier (≈), or "USD not listed"; where the USD figure
 * comes from shows on hover.
 *
 * @param props - the package
 * @returns the price
 */
function Price({ pack }: { pack: ShopPackage }) {
  const { krw, usd, from } = priceTexts(pack);
  return (
    <span className="fig price" title={from}>
      {krw}
      <span className="fig-sub">{usd}</span>
    </span>
  );
}

/**
 * The packages' table columns: the verdict and the price first, then the
 * verdict's words on one line, who it suits, what it feeds, its Crystal
 * value and sources.
 *
 * @param mode - the team-power mode, for the power-source links
 * @param data - the lists, to name the power sources a package feeds
 * @param index - the source index
 * @returns the columns
 */
function packageColumns(
  mode: ModeSection,
  data: TeamPowerData,
  index: SourceIndex,
): Column<ShopPackage>[] {
  return [
    { header: "Verdict", cell: (p) => <VerdictPill pack={p} />, className: "verdict-cell" },
    {
      header: "Package",
      cell: (p) => (
        <span className="pack-name">
          <b>{p.nameEn}</b>
          <span className="kr">{p.nameKr}</span>
          <span className="muted">{p.kind}</span>
        </span>
      ),
      className: "pack-cell",
    },
    { header: "Price", cell: (p) => <Price pack={p} />, className: "n" },
    {
      header: "Why",
      cell: (p) => (
        <>
          <Clamp lines={1}>{p.verdict}</Clamp>
          {p.contents ? (
            <div className="muted">
              <Clamp lines={1}>{p.contents}</Clamp>
            </div>
          ) : null}
        </>
      ),
      className: "wide pack-why",
    },
    { header: "Spender", cell: (p) => <span className="chip spender">{SPENDERS[p.tier]}</span> },
    {
      header: "Feeds",
      cell: (p) => (
        <span className="feeds">
          {p.feeds.map((slug, i) => (
            <span key={slug}>
              {i > 0 ? ", " : null}
              <PowerSourceLink mode={mode} slug={slug} sources={data.sources} />
            </span>
          ))}
        </span>
      ),
    },
    {
      header: "Crystal value",
      cell: (p) => (
        <span title="Contents against the plain Crystal pack; not team power">
          {crystalText(p)}
        </span>
      ),
      className: "n",
    },
    {
      header: "Sources",
      cell: (p) => <SourceChips ids={p.sources} sources={index} max={2} />,
    },
  ];
}

/**
 * The text a package row's filter matches: everything its cells show, from
 * the same helpers they use.
 *
 * @param p - the package
 * @param data - the lists, to name what it feeds
 * @returns the text
 */
function packageText(p: ShopPackage, data: TeamPowerData): string {
  const feeds = p.feeds.map((slug) => data.sources.find((s) => s.slug === slug)?.nameEn ?? slug);
  const { krw, usd, from } = priceTexts(p);
  return [
    p.nameEn,
    p.nameKr,
    krw,
    usd,
    from,
    p.kind,
    ...feeds,
    TIERS[p.tier],
    crystalText(p),
    p.contents ?? "",
    p.verdict,
    verdictLabel(p),
    ...p.sources.map(sourceLabel),
  ].join(" ");
}

/** Props for {@link PackagesView}. */
export interface PackagesViewProps {
  /** The team-power mode. */
  mode: ModeSection;
  /** Its team-power screens' config. */
  teamPower: TeamPowerConfig;
  /** The current search params. */
  search: PackagesSearch;
  /** Applies a patch to the search params. */
  onSearch: (patch: PackagesSearch) => void;
}

/**
 * The shop packages, buys first and skips last, each with its verdict
 * pill and KRW and USD price up front, then its words, spender, what it
 * feeds and its Crystal value; filtered by spender
 * tier and text (in the URL as `?tier=` and `?q=`); then, folded, the
 * price tiers the inferred USD prices come from.
 *
 * @param props - the mode, its team-power config, the search params and their setter
 * @returns the view
 */
export function PackagesView({ mode, teamPower, search, onSearch }: PackagesViewProps) {
  const index = useSourceIndex();
  const state = useTeamPowerData();
  const { title, lede } = teamPower.packages;
  const tierColumns: Column<PriceTier>[] = [
    { header: "KRW", cell: (t) => formatKrw(t.krw), className: "n" },
    { header: "USD", cell: (t) => formatUsd(t.usd), className: "n" },
    { header: "Paired by", cell: (t) => t.pairedBy, className: "wide" },
    { header: "Sources", cell: (t) => <SourceChips ids={t.sources} sources={index} /> },
  ];
  return (
    <>
      <ViewHeader title={title} lede={lede} />
      <TeamPowerLoaded state={state}>
        {(data) => (
          <>
            <DataTable
              columns={packageColumns(mode, data, index)}
              rows={byVerdict(data.packages).filter((p) => !search.tier || p.tier === search.tier)}
              rowKey={(p) => p.id}
              layout="stack"
              empty="No packages recorded yet."
              filter={{
                value: search.q ?? "",
                onChange: (q) => onSearch({ q }),
                text: (p) => packageText(p, data),
                placeholder: "Filter packages",
              }}
              select={{
                name: "Spender",
                label: "Every spender",
                options: Object.entries(TIERS),
                value: search.tier ?? "",
                onChange: (tier) =>
                  onSearch({ tier: (tier || undefined) as PackagesSearch["tier"] }),
              }}
            />
            <details className="card">
              <summary>Where the inferred USD prices come from</summary>
              <p className="muted">
                A package the US store doesn't list takes the USD price its KRW price pairs with on
                both stores.
              </p>
              <DataTable
                columns={tierColumns}
                rows={data.tiers}
                rowKey={(t) => t.id}
                empty="No price tiers recorded yet."
              />
            </details>
          </>
        )}
      </TeamPowerLoaded>
    </>
  );
}
