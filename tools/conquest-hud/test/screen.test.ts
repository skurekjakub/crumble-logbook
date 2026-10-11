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
 * Encodes a 2x2 RGB PNG whose rows use the given filters.
 *
 * @param rows - per row, the filter byte and the filtered bytes.
 * @returns the PNG file.
 */
function png(rows: number[][]): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(2, 0);
  ihdr.writeUInt32BE(rows.length, 4);
  ihdr.set([8, 2, 0, 0, 0], 8);
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
    expect(() => decodeScreen(raw)).toThrow(ScreenError);
  });

  it("decodes an RGB PNG through its row filters", () => {
    // Row 0 unfiltered: (10,20,30) (40,50,60). Row 1 Sub, then Up: (11,22,33) (44,55,66).
    const subRow = [1, 11, 22, 33, 44 - 11, 55 - 22, 66 - 33];
    const upRow = [2, 11 - 10, 22 - 20, 33 - 30, 44 - 40, 55 - 50, 66 - 60];
    for (const second of [subRow, upRow]) {
      const screen = decodeScreen(png([[0, 10, 20, 30, 40, 50, 60], second]));
      expect([...screen.rgba]).toEqual([
        10, 20, 30, 255, 40, 50, 60, 255, 11, 22, 33, 255, 44, 55, 66, 255,
      ]);
    }
  });

  it("decodes the Average and Paeth filters", () => {
    // Row 1 is (11,22,33) (44,55,66) under each filter, with row 0 (10,20,30) (40,50,60).
    const avg = [
      3,
      11 - 5,
      22 - 10,
      33 - 15,
      44 - ((11 + 40) >> 1),
      55 - ((22 + 50) >> 1),
      66 - ((33 + 60) >> 1),
    ];
    const paeth = [4, 11 - 10, 22 - 20, 33 - 30, 44 - 40, 55 - 50, 66 - 60];
    for (const second of [avg, paeth]) {
      const screen = decodeScreen(png([[0, 10, 20, 30, 40, 50, 60], second]));
      expect([...screen.rgba.subarray(8)]).toEqual([11, 22, 33, 255, 44, 55, 66, 255]);
    }
  });
});
