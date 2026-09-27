import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * The repo's ESLint flat config: type-aware typescript-eslint rules for every workspace package, React hook
 * rules for the web app, and relaxed rules for tests and CLI scripts. Formatting is Prettier's job, so no
 * stylistic rules are enabled. Type information comes from each package's own tsconfig via the project service.
 *
 * @param rootDir - absolute path of the repo root, used to resolve the tsconfigs.
 * @returns the flat config array for the root `eslint.config.ts`.
 */
export function crumbleConfig(rootDir: string) {
  return defineConfig(
    globalIgnores([
      "**/node_modules/",
      "**/dist/",
      "**/migrations/",
      "apps/web/src/routeTree.gen.ts",
      "research/",
      "data/",
      "docs/",
      ".claude/",
      ".superpowers/",
    ]),

    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    {
      languageOptions: {
        parserOptions: { projectService: true, tsconfigRootDir: rootDir },
        globals: globals.node,
      },
      linterOptions: { reportUnusedDisableDirectives: "error" },
      rules: {
        // With `noUncheckedIndexedAccess`, `!` is the explicit, reviewable way to say "this index exists".
        "@typescript-eslint/no-non-null-assertion": "off",
        // `Record<never, never>` is the deliberate "no filters" default of the registry's mapped types.
        "@typescript-eslint/no-generated-empty-object-type": "off",
        // Single-use type parameters carry inference through the registry and view helpers.
        "@typescript-eslint/no-unnecessary-type-parameters": "off",
        // TanStack Router's `redirect()` is thrown by design.
        "@typescript-eslint/only-throw-error": [
          "error",
          { allow: [{ from: "package", package: "@tanstack/router-core", name: "Redirect" }] },
        ],
        // Template literals with numbers are how the views format stats; the rule's default only allows strings.
        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        // Arrow shorthands such as `onClick={() => setOpen(false)}` return a void call by design.
        "@typescript-eslint/no-confusing-void-expression": [
          "error",
          { ignoreArrowShorthand: true },
        ],
        // Unused names prefixed with `_` are deliberate (positional args, destructuring to omit a key).
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
        ],
        // Server code logs through the CLI and the startup line only; anywhere else a console call is a leftover.
        "no-console": "error",
        eqeqeq: ["error", "always", { null: "ignore" }],
      },
    },

    {
      files: ["apps/web/**/*.{ts,tsx}"],
      extends: [reactHooks.configs.flat["recommended-latest"]],
      languageOptions: { globals: globals.browser },
    },

    {
      // CLI scripts and the server entry report to the terminal.
      files: ["apps/server/src/cli/**", "apps/server/src/main.ts", "apps/server/src/app.ts"],
      rules: { "no-console": "off" },
    },

    {
      // Tests assert on shapes they just built; loose typing is fine there.
      files: ["**/test/**", "**/*.test.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/unbound-method": "off",
      },
    },
  );
}
