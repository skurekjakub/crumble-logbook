import { defineProject } from "vitest/config";
import { SHARED_TEST } from "../../vitest.shared";

/** Vitest project for the server, with the workspace's shared test options. */
export default defineProject({ test: SHARED_TEST });
