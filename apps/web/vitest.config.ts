import react from "@vitejs/plugin-react";
import { defineProject } from "vitest/config";
import { SHARED_TEST } from "../../vitest.shared";

/** Vitest project for the web app: jsdom, Testing Library matchers, and cleanup between tests. */
export default defineProject({
  plugins: [react()],
  test: {
    ...SHARED_TEST,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
  },
});
