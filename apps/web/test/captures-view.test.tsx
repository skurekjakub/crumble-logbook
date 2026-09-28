import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Capture } from "../src/api/types";
import { captureTime, evidenceFolder } from "../src/lib/captures";
import { bodyRows, renderRoute } from "./view-harness";

const SLUG = "001-guild-conquest-meta";

const capture = (o: Pick<Capture, "id" | "path"> & Partial<Capture>): Capture => ({
  recordSlug: SLUG,
  url: "https://m.dcinside.com/board/projectcc/1",
  capturedAt: "2026-09-27T10:39:53+02:00",
  approx: null,
  tool: "capture:dc",
  sha256: "0".repeat(64),
  ...o,
});

const CAPTURES = [
  capture({ id: 1, path: "evidence/03-dc-posts/1.md", approx: "header", tool: "python:dc_scrape" }),
  capture({
    id: 2,
    path: "evidence/03-dc-posts/img/1-1.jpg",
    approx: "post",
    tool: "python:dc_scrape",
  }),
  capture({
    id: 3,
    path: "evidence/08-extract/dc.json",
    url: null,
    approx: "git",
    tool: "unknown",
  }),
  capture({ id: 4, path: "evidence/15-crumbgg/pub-stats.json", url: "https://crumb.gg/pub/stats" }),
];

const API = { [`/api/captures?record=${SLUG}`]: { body: CAPTURES } };

const panel = () => screen.getByRole("main");

describe("capture ledger helpers", () => {
  it("shows a ledger time as the capturing machine's clock", () => {
    expect(captureTime("2026-09-27T10:39:53+02:00")).toBe("2026-09-27 10:39 +02:00");
    expect(captureTime("2026-09-27T08:39:53Z")).toBe("2026-09-27 08:39 UTC");
    expect(captureTime("yesterday")).toBe("yesterday");
  });

  it("files a capture under its first evidence folder", () => {
    expect(evidenceFolder("evidence/03-dc-posts/img/1-1.jpg")).toBe("evidence/03-dc-posts");
    expect(evidenceFolder("evidence/01-access-probe.tsv")).toBe("evidence");
  });
});

describe("/research/$slug/captures", () => {
  it("lists the record's ledger: path, URL, time with its approximation, tool", async () => {
    await renderRoute(`/research/${SLUG}/captures`, API);
    expect(await screen.findByRole("heading", { name: "Captures" })).toBeVisible();
    expect(screen.getByText(`research/${SLUG}/`)).toHaveClass("mono");
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(4));
    const rows = bodyRows(panel());
    expect(rows[0]).toEqual([
      "evidence/03-dc-posts/1.md",
      "https://m.dcinside.com/board/projectcc/1",
      "≈2026-09-27 10:39 +02:00",
      "python:dc_scrape",
    ]);
    expect(rows[2]![1]).toBe("–");
    expect(rows[3]![2]).toBe("2026-09-27 10:39 +02:00");
    expect(screen.getByTitle(/the post the image belongs to/)).toHaveTextContent("≈");
    expect(screen.getByRole("link", { name: "https://crumb.gg/pub/stats" })).toHaveAttribute(
      "href",
      "https://crumb.gg/pub/stats",
    );
  });

  it("filters by folder and tool, keeping both in the URL", async () => {
    const router = await renderRoute(`/research/${SLUG}/captures`, API);
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(4));
    const folder = screen.getByRole("combobox", { name: "Folder" });
    expect(
      within(folder)
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual([
      "All folders",
      "evidence/03-dc-posts",
      "evidence/08-extract",
      "evidence/15-crumbgg",
    ]);
    fireEvent.change(folder, { target: { value: "evidence/03-dc-posts" } });
    await waitFor(() => expect(bodyRows(panel())).toHaveLength(2));
    fireEvent.change(screen.getByRole("combobox", { name: "Tool" }), {
      target: { value: "unknown" },
    });
    await waitFor(() => expect(bodyRows(panel())).toEqual([["Nothing matches."]]));
    expect(router.state.location.search).toEqual({
      folder: "evidence/03-dc-posts",
      tool: "unknown",
    });
  });

  it("searches paths and URLs through ?q=", async () => {
    await renderRoute(`/research/${SLUG}/captures?q=crumb.gg`, API);
    await waitFor(() =>
      expect(bodyRows(panel()).map((r) => r[0])).toEqual(["evidence/15-crumbgg/pub-stats.json"]),
    );
  });

  it("says so when the record has no ledger loaded", async () => {
    await renderRoute(`/research/${SLUG}/captures`, {
      [`/api/captures?record=${SLUG}`]: { body: [] },
    });
    await waitFor(() =>
      expect(bodyRows(panel())).toEqual([["This record has no capture ledger loaded."]]),
    );
  });

  it("keeps the Research section current, as a page under it", async () => {
    await renderRoute(`/research/${SLUG}/captures`, API);
    const modes = screen.getByRole("navigation", { name: "Logbook" });
    expect(within(modes).getByRole("link", { name: "Research" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
