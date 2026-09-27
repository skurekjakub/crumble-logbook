import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GlossaryEntry } from "../src/api/types";
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
];

describe("sources view", () => {
  it("lists sources newest first with relevance and the capture path", async () => {
    await renderRoute("/sources");
    expect(await screen.findByRole("heading", { name: "Sources" })).toBeVisible();
    expect(screen.getByText(/Every post this logbook cites/)).toHaveClass("lede");
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    const rows = bodyRows(panel());
    expect(rows.map((r) => r[0])).toEqual(["Naver 43653", "DC 76135", "crumbgg:rankings-s5"]);
    expect(rows[1]).toEqual([
      "DC 76135",
      "1T 인증1T screenshot",
      "2026-09-20",
      "3",
      "research/001-guild-conquest-meta/evidence/03-dc-posts/76135.md",
    ]);
    expect(screen.getByRole("link", { name: "DC 76135" })).toHaveAttribute(
      "href",
      "https://example.test/dc/76135",
    );
    expect(screen.getByText(/03-dc-posts\/76135\.md/)).toHaveClass("mono");
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
  it("maps Korean and shorthand to English, falling back to Korean", async () => {
    await renderRoute("/glossary", { "/api/glossary": { body: GLOSSARY } });
    expect(await screen.findByRole("heading", { name: "Glossary" })).toBeVisible();
    expect(screen.getByText(/forum shorthand mapped to the English client/)).toHaveClass("lede");
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    expect(bodyRows(panel())).toEqual([
      ["석류맛 쿠키", "석류", "Pomegranate Cookie", "cookie"],
      ["밀크맛 쿠키", "밀크, 우유", "Milk Cookie", "cookie"],
      ["스킬 가속", "가속", "스킬 가속", "stat"],
    ]);
  });

  it("finds an entry by its shorthand", async () => {
    const router = await renderRoute("/glossary", { "/api/glossary": { body: GLOSSARY } });
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(3));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search Korean or English" }), {
      target: { value: "우유" },
    });
    await waitFor(() => expect(bodyRows(panel()).map((r) => r[2])).toEqual(["Milk Cookie"]));
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
