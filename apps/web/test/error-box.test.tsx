import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { decksQuery } from "../src/api/queries";
import { EmptyState } from "../src/components/EmptyState";
import { ErrorBox } from "../src/components/ErrorBox";
import { QueryResult } from "../src/components/QueryResult";
import { stubApi, testQueryClient } from "./helpers";

function DeckCount() {
  const decks = useQuery(decksQuery());
  return (
    <QueryResult query={decks} resource="decks">
      {(rows) => <p>{rows.length} decks</p>}
    </QueryResult>
  );
}

describe("ErrorBox", () => {
  it("names the resource and the error", () => {
    render(<ErrorBox resource="scores" error={new Error("boom")} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load scores: boom");
    expect(screen.getByRole("alert")).toHaveClass("error");
  });

  it("renders for a failed query while sibling content still renders", async () => {
    stubApi({ "/api/decks": { status: 500, body: { error: "internal" } } });
    render(
      <QueryClientProvider client={testQueryClient()}>
        <DeckCount />
        <p>Sibling content</p>
      </QueryClientProvider>,
    );
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Couldn't load decks");
    expect(alert).toHaveTextContent("500");
    expect(screen.getByText("Sibling content")).toBeInTheDocument();
  });

  it("uses the API's message when the error body has one", async () => {
    stubApi({
      "/api/decks": { status: 404, body: { error: "not_found", message: "deck not found: x" } },
    });
    render(
      <QueryClientProvider client={testQueryClient()}>
        <DeckCount />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("404 deck not found: x");
  });
});

describe("QueryResult", () => {
  it("shows a loading state, then the data", async () => {
    stubApi({ "/api/decks": { body: [] } });
    render(
      <QueryClientProvider client={testQueryClient()}>
        <DeckCount />
      </QueryClientProvider>,
    );
    expect(screen.getByText("Loading decks…")).toHaveClass("empty");
    expect(await screen.findByText("0 decks")).toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("renders the legacy empty box", () => {
    render(<EmptyState>No decks recorded yet.</EmptyState>);
    expect(screen.getByText("No decks recorded yet.")).toHaveClass("empty");
  });
});
