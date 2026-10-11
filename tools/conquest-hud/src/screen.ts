/**
 * A captured game screen, read from either of adb's screencap formats: the raw RGBA dump of
 * `adb exec-out screencap` and the PNG of `screencap -p`.
 *
 * @module
 */
import { inflateSync } from "node:zlib";

/** An RGBA image, 4 bytes per pixel, rows top to bottom. */
export interface Screen {
  width: number;
  height: number;
  rgba: Uint8Array;
}

/** A capture that is neither a whole raw screencap nor a PNG this reader decodes. */
export class ScreenError extends Error {
  override name = "ScreenError";
}

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** The raw dump's header: width, height, pixel format and colour space, each a little-endian UInt32. */
const RAW_HEADER = 16;

/**
 * Decodes a capture, telling the formats apart by the PNG signature.
 *
 * @param bytes - the capture file's contents.
 * @returns the decoded screen.
 * @throws ScreenError when the bytes are a truncated raw dump or an unsupported PNG.
 */
export function decodeScreen(bytes: Uint8Array): Screen {
  return PNG_SIGNATURE.every((b, i) => bytes[i] === b) ? decodePng(bytes) : decodeRaw(bytes);
}

/**
 * Decodes the raw dump of `adb exec-out screencap`: a header, then RGBA pixels.
 *
 * @param bytes - the dump.
 * @returns the decoded screen.
 * @throws ScreenError when the header's size is implausible or the pixels are cut short, as when
 *   screencap printed an error instead of an image.
 */
export function decodeRaw(bytes: Uint8Array): Screen {
  if (bytes.length < RAW_HEADER) throw new ScreenError("the capture is shorter than its header");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(0, true);
  const height = view.getUint32(4, true);
  if (width === 0 || height === 0 || width > 10000 || height > 10000)
    throw new ScreenError(`the capture's header gives an implausible size, ${width}x${height}`);
  if (bytes.length < RAW_HEADER + width * height * 4)
    throw new ScreenError(`the capture holds fewer pixels than ${width}x${height}`);
  return { width, height, rgba: bytes.subarray(RAW_HEADER, RAW_HEADER + width * height * 4) };
}

/**
 * Decodes the PNGs Android's screencap writes: 8-bit RGB or RGBA, not interlaced.
 *
 * @param bytes - the PNG file.
 * @returns the decoded screen.
 * @throws ScreenError for another bit depth, colour type or interlacing, or a corrupt file.
 */
export function decodePng(bytes: Uint8Array): Screen {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Uint8Array[] = [];
  for (let at = PNG_SIGNATURE.length; at + 8 <= bytes.length;) {
    const length = view.getUint32(at);
    const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
    const data = bytes.subarray(at + 8, at + 8 + length);
    if (type === "IHDR") {
      width = view.getUint32(at + 8);
      height = view.getUint32(at + 12);
      const [depth, colour, , , interlace] = data.subarray(8, 13);
      if (depth !== 8 || interlace !== 0 || (colour !== 2 && colour !== 6))
        throw new ScreenError("only 8-bit, non-interlaced RGB and RGBA PNGs are supported");
      channels = colour === 6 ? 4 : 3;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    at += 12 + length;
  }
  if (channels === 0) throw new ScreenError("the PNG has no header chunk");
  let packed: Buffer;
  try {
    packed = inflateSync(Buffer.concat(idat));
  } catch (err) {
    throw new ScreenError(`the PNG's image data doesn't inflate: ${String(err)}`);
  }
  const stride = width * channels;
  if (packed.length < height * (stride + 1))
    throw new ScreenError("the PNG's image data is cut short");
  return { width, height, rgba: toRgba(unfilter(packed, height, stride, channels), channels) };
}

/**
 * Reverses PNG's per-row filters.
 *
 * @param packed - the inflated image data: each row is a filter byte and `stride` bytes.
 * @param height - rows in the image.
 * @param stride - bytes per row, without the filter byte.
 * @param bpp - bytes per pixel.
 * @returns the unfiltered pixels, rows back to back.
 * @throws ScreenError for an unknown filter type.
 */
function unfilter(packed: Uint8Array, height: number, stride: number, bpp: number): Uint8Array {
  const out = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = packed[y * (stride + 1)]!;
    const src = y * (stride + 1) + 1;
    const row = y * stride;
    const prev = row - stride;
    for (let i = 0; i < stride; i++) {
      const raw = packed[src + i]!;
      const a = i >= bpp ? out[row + i - bpp]! : 0;
      const b = y > 0 ? out[prev + i]! : 0;
      const c = i >= bpp && y > 0 ? out[prev + i - bpp]! : 0;
      let value: number;
      switch (filter) {
        case 0:
          value = raw;
          break;
        case 1:
          value = raw + a;
          break;
        case 2:
          value = raw + b;
          break;
        case 3:
          value = raw + ((a + b) >> 1);
          break;
        case 4:
          value = raw + paeth(a, b, c);
          break;
        default:
          throw new ScreenError(`row ${y} has unknown PNG filter ${filter}`);
      }
      out[row + i] = value & 0xff;
    }
  }
  return out;
}

/**
 * PNG's Paeth predictor: whichever of left, up and upper-left is closest to left + up - upper-left.
 *
 * @param a - the byte to the left.
 * @param b - the byte above.
 * @param c - the byte above and to the left.
 * @returns the predicted byte.
 */
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/**
 * Widens RGB pixels to RGBA with an opaque alpha; RGBA passes through.
 *
 * @param pixels - pixels, `channels` bytes each.
 * @param channels - 3 for RGB, 4 for RGBA.
 * @returns RGBA pixels.
 */
function toRgba(pixels: Uint8Array, channels: number): Uint8Array {
  if (channels === 4) return pixels;
  const out = new Uint8Array((pixels.length / 3) * 4);
  for (let i = 0, o = 0; i < pixels.length; i += 3, o += 4) {
    out[o] = pixels[i]!;
    out[o + 1] = pixels[i + 1]!;
    out[o + 2] = pixels[i + 2]!;
    out[o + 3] = 255;
  }
  return out;
}
