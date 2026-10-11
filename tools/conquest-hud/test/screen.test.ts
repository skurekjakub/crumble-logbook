import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { decodeScreen, ScreenError } from "../src/screen.ts";

/**
 * Builds a PNG chunk; the CRC isn't checked by the decoder, so it is left zero.
 *
 * @param type - the chunk type, e.g. "IHDR".
 * @param data - the chunk's data.
 * @returns the chunk's bytes.
 */
function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, "latin1");
  return Buffer.concat([head, data, Buffer.alloc(4)]);
}

/**
 * Encodes a 2-pixel-wide, 8-bit PNG.
 *
 * @param rows - per row, the filter byte and the filtered bytes.
 * @param colour - the PNG colour type: 2 for RGB, 6 for RGBA.
 * @returns the PNG file.
 */
function png(rows: number[][], colour: 2 | 6 = 2): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(2, 0);
  ihdr.writeUInt32BE(rows.length, 4);
  ihdr.set([8, colour, 0, 0, 0], 8);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.from(rows.flat()))),
    chunk("IEND", new Uint8Array()),
  ]);
}

describe("decodeScreen", () => {
  it("decodes a raw screencap dump", () => {
    const raw = Buffer.alloc(16 + 2 * 1 * 4);
    raw.writeUInt32LE(2, 0);
    raw.writeUInt32LE(1, 4);
    raw.set([1, 2, 3, 255, 4, 5, 6, 255], 16);
    const screen = decodeScreen(raw);
    expect([screen.width, screen.height, [...screen.rgba]]).toEqual([
      2,
      1,
      [1, 2, 3, 255, 4, 5, 6, 255],
    ]);
  });

  it("refuses a raw dump cut short, as when screencap printed an error", () => {
    const raw = Buffer.alloc(16 + 4);
    raw.writeUInt32LE(2, 0);
    raw.writeUInt32LE(1, 4);
    expect(() => decodeScreen(raw)).toThrow(
      new ScreenError("the capture holds fewer pixels than 2x1"),
    );
  });

  // Row 0, unfiltered, sits above row 1. The bytes are picked so that in the second pixel,
  // Paeth predicts from the left byte in red, the byte above in green and the upper-left in blue.
  const ROW_0 = [0, 10, 22, 100, 12, 201, 150];
  it.for([
    ["Sub", [1, 100, 20, 50, 11, 191, 61]],
    ["Up", [2, 90, 254, 206, 99, 10, 217]],
    ["Average", [3, 95, 9, 0, 55, 101, 11]],
    ["Paeth", [4, 90, 254, 206, 11, 10, 11]],
  ] as const)("decodes an RGB PNG row under the %s filter", ([, row1]) => {
    const screen = decodeScreen(png([ROW_0, [...row1]]));
    expect([...screen.rgba.subarray(8)]).toEqual([100, 20, 50, 255, 111, 211, 111, 255]);
  });

  it("decodes an RGBA PNG, alpha and all", () => {
    const screen = decodeScreen(png([[1, 1, 2, 3, 4, 4, 4, 4, 4]], 6));
    expect([...screen.rgba]).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
