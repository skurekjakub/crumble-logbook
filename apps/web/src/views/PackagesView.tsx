import { useSourceIndex } from "../api/hooks";
import type { PriceTier, ShopPackage } from "../api/types";
import type { ModeSection, TeamPowerConfig } from "../app/modes";
import type { Column } from "../components/DataTable";
import { DataTable } from "../components/DataTable";
import { SourceChips } from "../components/SourceChips";
import { ViewHeader } from "../components/ViewHeader";
import { optionalKey, optionalText } from "../lib/search";
import type { SourceIndex } from "../lib/sources";
import { sourceLabel } from "../lib/sources";
import { formatKrw, formatUsd, usdPrice } from "../lib/team-power";
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

/**
 * A package's price: KRW, then USD as a store lists it or as its price
 * tier (≈), or "USD not listed", and under it where the USD figure comes from.
 *
 * @param props - the package
 * @returns the price
 */
function Price({ pack }: { pack: ShopPackage }) {
  const { krw, usd, from } = priceTexts(pack);
  return (
    <>
      <div>{krw}</div>
      <div className={usdPrice(pack)?.inferred === false ? undefined : "muted"}>{usd}</div>
      <div className="basis-note">{from}</div>
    </>
  );
}

/**
 * The packages' table columns.
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
    {
      header: "Package",
      cell: (p) => (
        <>
          <b>{p.nameEn}</b> <span className="kr">{p.nameKr}</span>
        </>
      ),
    },
    { header: "Price", cell: (p) => <Price pack={p} /> },
    { header: "Kind", cell: (p) => p.kind },
    {
      header: "Feeds",
      cell: (p) =>
        p.feeds.map((slug, i) => (
          <span key={slug}>
            {i > 0 ? ", " : null}
            <PowerSourceLink mode={mode} slug={slug} sources={data.sources} />
          </span>
        )),
    },
    { header: "Spender", cell: (p) => TIERS[p.tier] },
    { header: "Crystal value (not team power)", cell: crystalText, className: "n" },
    {
      header: "Verdict",
      cell: (p) => (
        <>
          {p.contents ? <div className="muted">{p.contents}</div> : null}
          {p.verdict}
        </>
      ),
      className: "wide",
    },
    { header: "Sources", cell: (p) => <SourceChips ids={p.sources} sources={index} /> },
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
 * The shop packages with their KRW and USD prices, what each feeds, the
 * spender it suits, its Crystal value and verdict, filtered by spender
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
              rows={data.packages.filter((p) => !search.tier || p.tier === search.tier)}
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
