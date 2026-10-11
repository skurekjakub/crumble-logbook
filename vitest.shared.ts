/**
 * Test options every Vitest project shares. A project doesn't inherit the root config's test
 * options, so each project's `vitest.config.ts` spreads these itself.
 *
 * The suite runs in parallel across the workspace, and on a busy machine (an emulator running
 * beside it) a test that takes well under a second alone can pass Vitest's 5 s default, so the
 * timeouts are generous.
 */
export const SHARED_TEST = {
  testTimeout: 30_000,
  hookTimeout: 30_000,
};
