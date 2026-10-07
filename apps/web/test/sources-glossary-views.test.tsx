import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GlossaryEntry, ResearchRecord } from "../src/api/types";
import { bodyRows, renderRoute, VIEW_SOURCES } from "./view-harness";

const panel = () => screen.getByRole("main");

const entry = (o: Pick<GlossaryEntry, "kr"> & Partial<GlossaryEntry>): GlossaryEntry => ({
  shorthand: [],
  en: null,
  kind: "cookie",
  element: null,
  class: null,
  rarity: null,
  extra: {},
  recordSlug: null,
  ...o,
});

const GLOSSARY = [
  entry({ kr: "석류맛 쿠키", shorthand: ["석류"], en: "Pomegranate Cookie" }),
  entry({ kr: "밀크맛 쿠키", shorthand: ["밀크", "우유"], en: "Milk Cookie" }),
  entry({ kr: "스킬 가속", shorthand: ["가속"], en: null, kind: "stat" }),
  entry({ kr: "스킬 가속력", en: "Skill Haste", kind: "term" }),
];

const RECORDS = [
  {
    slug: "001-guild-conquest-meta",
    question: "Which teams reach 1T?",
    status: "active",
    startedAt: "2026-09-20",
    updatedAt: "2026-09-27",
    seasonLabel: null,
    lede: null,
    caveat: null,
    mode: "guild_conquest",
    modes: [],
  },
  {
    slug: "002-pvp-meta",
    question: "What wins in PvP?",
    status: "active",
    startedAt: "2026-09-27",
    updatedAt: "2026-09-27",
    seasonLabel: null,
    lede: null,
    caveat: null,
    mode: "arena",
    modes: [],
  },
] satisfies ResearchRecord[];

describe("sources view", () => {
  it("lists sources newest first: link, English title over the original, relevance dots, records and capture", async () => {
    await renderRoute("/sources", { "/api/records": { body: RECORDS } });
    expect(await screen.findByRole("heading", { name: "Sources" })).toBeVisible();
    expect(screen.getByText(/Every post this logbook cites/).closest("ul")).toHaveClass("points");
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    const rows = bodyRows(panel());
    expect(rows.map((r) => r[0])).toEqual(["Naver 43653", "DC 76135", "crumbgg:rankings-s5"]);
    await waitFor(() => expect(bodyRows(panel())[1]![4]).toBe("001 Guild Conquest"));
    expect(bodyRows(panel())[1]).toEqual([
      "DC 76135",
      "1T screenshot1T 인증",
      "2026-09-20",
      "",
      "001 Guild Conquest",
      "≈2026-09-27 10:39 +02:00 python:dc_scraperesearch/001-guild-conquest-meta/evidence/03-dc-posts/76135.md",
    ]);
    expect(rows[0]![1]).toBe("체리덱 정리");
    expect(rows[0]!.at(-1)).toBe("");
    expect(rows[2]!.at(-1)).toBe(
      "2026-09-27 14:34 +02:00 curlresearch/001-guild-conquest-meta/evidence/12-crumbgg/s5.json",
    );
    expect(screen.getByRole("link", { name: "DC 76135" })).toHaveAttribute(
      "href",
      "https://example.test/dc/76135",
    );
    expect(
      screen.getByRole("img", { name: "Relevance 3 of 3" }).querySelectorAll("i.on"),
    ).toHaveLength(3);
    expect(
      screen.getByRole("img", { name: "Relevance 2 of 3" }).querySelectorAll("i.on"),
    ).toHaveLength(2);
    expect(screen.getAllByText("001 Guild Conquest", { selector: ".chip" })[0]).toHaveAttribute(
      "title",
      "001-guild-conquest-meta",
    );
    expect(screen.getByText(/03-dc-posts\/76135\.md/)).toHaveClass("mono");
  });

  it("narrows to one record through ?record=", async () => {
    const router = await renderRoute("/sources", {
      "/api/records": { body: RECORDS },
      "/api/sources?record=002-pvp-meta": { body: [] },
    });
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    const select = screen.getByRole("combobox", { name: "Record" });
    await waitFor(() => expect(within(select).getAllByRole("option")).toHaveLength(3));
    expect(within(select).getByRole("option", { name: "002 Arena" })).toHaveValue("002-pvp-meta");
    fireEvent.change(select, { target: { value: "002-pvp-meta" } });
    await waitFor(() => expect(router.state.location.search).toEqual({ record: "002-pvp-meta" }));
    await waitFor(() => expect(bodyRows(panel())).toEqual([["No sources match these filters."]]));
  });

  it("marks a backfilled capture time as approximate, saying why", async () => {
    await renderRoute("/sources");
    const marker = await screen.findByTitle(/from the capture's own header/);
    expect(marker).toHaveTextContent("≈");
    expect(screen.getAllByTitle(/^Approximate/)).toHaveLength(1);
  });

  it("narrows to one site through ?site=", async () => {
    const router = await renderRoute("/sources", {
      "/api/sources?site=dc": { body: [VIEW_SOURCES[0]] },
    });
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    fireEvent.change(screen.getByRole("combobox", { name: "Site" }), {
      target: { value: "dc" },
    });
    await waitFor(() => expect(router.state.location.search).toEqual({ site: "dc" }));
    await waitFor(() => expect(bodyRows(panel()).map((r) => r[0])).toEqual(["DC 76135"]));
  });

  it("filters titles through the search box", async () => {
    await renderRoute("/sources?q=cherry");
    await waitFor(() => expect(bodyRows(panel())).toEqual([["Nothing matches."]]));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search titles" }), {
      target: { value: "체리" },
    });
    await waitFor(() => expect(bodyRows(panel()).map((r) => r[0])).toEqual(["Naver 43653"]));
  });

  it("shows an empty message with no sources", async () => {
    await renderRoute("/sources", { "/api/sources": { body: [] } });
    await waitFor(() => expect(bodyRows(panel())).toEqual([["No sources recorded yet."]]));
  });
});

describe("glossary view", () => {
  it("names each entry in short English over its Korean, cookies and pets with a portrait, shorthand as chips", async () => {
    await renderRoute("/glossary", { "/api/glossary": { body: GLOSSARY } });
    expect(await screen.findByRole("heading", { name: "Glossary" })).toBeVisible();
    expect(
      screen.getByText(/forum shorthand, mapped to the English client/).closest("ul"),
    ).toHaveClass("points");
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(4));
    expect(bodyRows(panel())).toEqual([
      ["Pomegranate석류맛 쿠키", "석류", "cookie"],
      ["Milk밀크맛 쿠키", "밀크우유", "cookie"],
      ["스킬 가속", "가속", "stat"],
      ["Skill Haste스킬 가속력", "", "term"],
    ]);
    const rows = [...panel().querySelectorAll("tbody tr")];
    expect(rows[0]!.querySelector(".cicon")).not.toBeNull();
    expect(rows[0]!.querySelector(".name-row")).toHaveAttribute("title", "Pomegranate Cookie");
    expect(rows[2]!.querySelector(".cicon")).toBeNull();
    expect(rows[3]!.querySelector(".cicon")).toBeNull();
    expect(within(rows[1] as HTMLElement).getByText("우유")).toHaveClass("chip");
    expect(within(rows[0] as HTMLElement).getByText("cookie")).toHaveClass("kind", "k-cookie");
  });

  it("finds an entry by its shorthand", async () => {
    const router = await renderRoute("/glossary", { "/api/glossary": { body: GLOSSARY } });
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(4));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search Korean or English" }), {
      target: { value: "우유" },
    });
    await waitFor(() => expect(bodyRows(panel()).map((r) => r[0])).toEqual(["Milk밀크맛 쿠키"]));
    expect(router.state.location.search).toEqual({ q: "우유" });
  });

  it("narrows by kind through ?kind=", async () => {
    await renderRoute("/glossary?kind=stat", {
      "/api/glossary?kind=stat": { body: [GLOSSARY[2]] },
    });
    await waitFor(() => expect(bodyRows(panel()).map((r) => r[0])).toEqual(["스킬 가속"]));
    expect(screen.getByRole("combobox", { name: "Kind" })).toHaveValue("stat");
  });

  it("shows an empty message with no entries", async () => {
    await renderRoute("/glossary", { "/api/glossary": { body: [] } });
    await waitFor(() => expect(bodyRows(panel())).toEqual([["No glossary entries yet."]]));
  });
});
