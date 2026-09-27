import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom doesn't implement scrolling; the router calls it on every navigation.
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
