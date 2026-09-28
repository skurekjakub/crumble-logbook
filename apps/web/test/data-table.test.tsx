import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Column } from "../src/components/DataTable";
import { DataTable, filterRows } from "../src/components/DataTable";

interface Entry {
  kr: string;
  en: string | null;
  kind: string;
}

const ROWS: Entry[] = [
  { kr: "우유", en: "Milk", kind: "cookie" },
  { kr: "브시커", en: "Brightseeker", kind: "cookie" },
  { kr: "와사비문어", en: "Octo Wasabi", kind: "pet" },
];

const COLUMNS: Column<Entry>[] = [
  { header: "Korean", cell: (r) => r.kr },
  { header: "English", cell: (r) => r.en ?? "?" },
  { header: "Kind", cell: (r) => r.kind, className: "n" },
];

const text = (r: Entry) => `${r.kr} ${r.en ?? ""}`;

/**
 * Reads the rows of the table body as arrays of cell text.
 *
 * @returns one array of cell texts per body row
 */
function bodyRows(): string[][] {
  const body = screen.getAllByRole("rowgroup")[1]!;
  return within(body)
    .getAllByRole("row")
    .map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent));
}

function Harness({ initial = "" }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  return (
    <DataTable
      columns={COLUMNS}
      rows={ROWS}
      rowKey={(r) => r.kr}
      filter={{ value: q, onChange: setQ, text, placeholder: "Search Korean or English" }}
    />
  );
}

describe("selects", () => {
  it("renders every select and keeps the rows that pass them all", () => {
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.kr}
        select={{
          name: "Kind",
          label: "All kinds",
          options: [["cookie", "Cookie"]],
          value: "cookie",
          onChange: () => {},
          test: (r, v) => r.kind === v,
        }}
        selects={[
          {
            name: "Named",
            label: "Any name",
            options: [["M", "Starts with M"]],
            value: "M",
            onChange: () => {},
            test: (r, v) => (r.en ?? "").startsWith(v),
          },
        ]}
      />,
    );
    expect(screen.getByRole("combobox", { name: "Kind" })).toHaveValue("cookie");
    expect(screen.getByRole("combobox", { name: "Named" })).toHaveValue("M");
    expect(bodyRows()).toEqual([["우유", "Milk", "cookie"]]);
  });
});

describe("filterRows", () => {
  it("matches case-insensitively on the trimmed query", () => {
    expect(filterRows(ROWS, "  MIL ", text).map((r) => r.en)).toEqual(["Milk"]);
    expect(filterRows(ROWS, "", text)).toHaveLength(3);
  });
});

describe("DataTable", () => {
  it("renders headers, cells and cell classes", () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.kr} />);
    expect(screen.getAllByRole("columnheader").map((th) => th.textContent)).toEqual([
      "Korean",
      "English",
      "Kind",
    ]);
    expect(bodyRows()).toHaveLength(3);
    expect(screen.getByText("pet")).toHaveClass("n");
  });

  it("scrolls on a phone by default, and labels each cell with its column when stacked", () => {
    const { unmount } = render(<DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.kr} />);
    expect(screen.getByRole("table")).toHaveClass("scroll");
    unmount();
    render(<DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.kr} layout="stack" />);
    expect(screen.getByRole("table")).toHaveClass("stack");
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getByText("Octo Wasabi")).toHaveAttribute("data-label", "English");
    expect(screen.getByText("pet")).toHaveAttribute("data-label", "Kind");
    expect(bodyRows()[2]).toEqual(["와사비문어", "Octo Wasabi", "pet"]);
  });

  it("narrows rows as the filter changes", () => {
    render(<Harness />);
    const box = screen.getByRole("searchbox", { name: "Search Korean or English" });
    fireEvent.change(box, { target: { value: "wasabi" } });
    expect(bodyRows()).toEqual([["와사비문어", "Octo Wasabi", "pet"]]);
    fireEvent.change(box, { target: { value: "" } });
    expect(bodyRows()).toHaveLength(3);
  });

  it("applies a filter value supplied by the caller (e.g. from a search param)", () => {
    render(<Harness initial="브시" />);
    expect(screen.getByRole("searchbox")).toHaveValue("브시");
    expect(bodyRows()).toEqual([["브시커", "Brightseeker", "cookie"]]);
  });

  it("reports edits through onChange without filtering on its own state", () => {
    const onChange = vi.fn();
    render(
      <DataTable
        columns={COLUMNS}
        rows={ROWS}
        rowKey={(r) => r.kr}
        filter={{ value: "", onChange, text }}
      />,
    );
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "milk" } });
    expect(onChange).toHaveBeenCalledWith("milk");
    expect(bodyRows()).toHaveLength(3);
  });

  it("filters by a select when the caller supplies a test", () => {
    function SelectHarness() {
      const [kind, setKind] = useState("");
      return (
        <DataTable
          columns={COLUMNS}
          rows={ROWS}
          rowKey={(r) => r.kr}
          select={{
            name: "Kind",
            label: "All kinds",
            options: [
              ["cookie", "cookie"],
              ["pet", "pet"],
            ],
            value: kind,
            onChange: setKind,
            test: (r, v) => r.kind === v,
          }}
        />
      );
    }
    render(<SelectHarness />);
    const select = screen.getByRole("combobox", { name: "Kind" });
    expect(within(select).getByRole("option", { name: "All kinds" })).toHaveValue("");
    fireEvent.change(select, { target: { value: "pet" } });
    expect(bodyRows()).toEqual([["와사비문어", "Octo Wasabi", "pet"]]);
    // The accessible name stays the control's label, not the selected option's text.
    expect(screen.getByRole("combobox", { name: "Kind" })).toHaveValue("pet");
  });

  it("says nothing matches when the filter excludes every row", () => {
    render(<Harness initial="zzz" />);
    expect(bodyRows()).toEqual([["Nothing matches."]]);
  });

  it("shows the empty message when there are no rows at all", () => {
    render(<DataTable columns={COLUMNS} rows={[]} rowKey={(r) => r.kr} />);
    expect(bodyRows()).toEqual([["Nothing to show."]]);
  });
});
