import { defineConfig } from "vitest/config";
import { SHARED_TEST } from "./vitest.shared";

export default defineConfig({
  test: {
    ...SHARED_TEST,
    projects: ["packages/*", "apps/*", "tools/hud"],
  },
});
