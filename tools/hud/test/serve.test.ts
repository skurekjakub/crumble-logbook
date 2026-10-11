import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PassThrough } from "node:stream";
import { afterAll, describe, expect, it } from "vitest";
import { serve } from "../src/serve.ts";
import { blankScreen, drawNumber, rawDump, STAGE_BAR_LAYOUT, stageTemplates } from "./helpers.ts";

const dir = mkdtempSync(join(tmpdir(), "hud-serve-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/**
 * Writes a raw capture of a screen showing a stage's number in the top bar.
 *
 * @param shown - the number, e.g. "358-20".
 * @returns the capture's path.
 */
function stageCapture(shown: string): string {
  const screen = blankScreen();
  drawNumber(screen, shown, STAGE_BAR_LAYOUT);
  const path = join(dir, `${shown}.bin`);
  writeFileSync(path, rawDump(screen));
  return path;
}

/**
 * Sends requests to a reader serving synthetic stage templates and collects its answers.
 *
 * @param requests - the request lines.
 * @returns everything it wrote once its input closed.
 */
async function exchange(requests: string[]): Promise<string> {
  const input = new PassThrough();
  const output = new PassThrough();
  let written = "";
  output.on("data", (chunk: Buffer) => (written += chunk.toString("utf8")));
  const served = serve(input, output, stageTemplates);
  input.end(requests.map((r) => `${r}\n`).join(""));
  await served;
  return written;
}

describe("serve", () => {
  it("answers each request with the command's own output, then a blank line", async () => {
    const answers = await exchange([
      `stage ${stageCapture("358-20")}`,
      `read ${stageCapture("359-1")}`,
    ]);
    expect(answers).toMatch(/^stage 358-20\n\nscore .+\ntimer .+\nfinal .+\n\n$/);
  });

  it("answers a capture it can't decode with the error on one line, and keeps serving", async () => {
    const short = join(dir, "short.bin");
    writeFileSync(short, Buffer.alloc(8));
    expect(await exchange([`stage ${short}`, `stage ${stageCapture("358-21")}`])).toBe(
      "the capture is shorter than its header\n\nstage 358-21\n\n",
    );
  });

  it("answers a request that isn't a read with its usage", async () => {
    expect(await exchange(["learn x.bin stage 358-20", "stage"])).toBe(
      "usage: read <capture> | stage <capture>\n\n".repeat(2),
    );
  });
});

describe("cli.ts serve", () => {
  it("answers on stdout until stdin closes, then exits cleanly", () => {
    const run = spawnSync(
      process.execPath,
      [join(import.meta.dirname, "..", "src", "cli.ts"), "serve"],
      { input: "nope\n", encoding: "utf8" },
    );
    expect([run.status, run.stdout]).toEqual([0, "usage: read <capture> | stage <capture>\n\n"]);
  });
});
