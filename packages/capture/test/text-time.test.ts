import { describe, expect, it } from "vitest";
import { getText, parseHtml } from "../src/html";
import { pyCollapse, pyJsonRedump, pyQuote, pyRepr, pyStrip, toLf } from "../src/text";
import { headerStamp, isoFromHeader, isoLocal, localDate, localMinute } from "../src/time";

describe("python-compatible text", () => {
  it("strips Python's whitespace set, not JavaScript's", () => {
    expect(pyStrip("  a 　")).toBe("a");
    expect(pyStrip("﻿a\u001f")).toBe("﻿a");
    expect(pyStrip("​")).toBe("​");
    expect(pyCollapse("a \n\t b\u0085c")).toBe("a b c");
  });

  it("prints values as Python's repr and json.dumps do", () => {
    expect(pyRepr([])).toBe("[]");
    expect(pyRepr([{ tuple: ["ko", "asr"] }])).toBe("[('ko', 'asr')]");
    expect(pyRepr("it's")).toBe('"it\'s"');
    expect(pyRepr(null)).toBe("None");
    expect(pyJsonRedump('{"a":[1,"é"],"b":null,"c":true}')).toBe(
      '{"a": [1, "\\u00e9"], "b": null, "c": true}',
    );
    expect(pyJsonRedump('"😀"')).toBe('"\\ud83d\\ude00"');
    expect(() => pyJsonRedump('{"a": 1,}')).toThrow(SyntaxError);
    expect(() => pyJsonRedump(`"a${String.fromCharCode(1)}"`)).toThrow(SyntaxError);
    expect(toLf("a\r\nb\rc\n")).toBe("a\nb\rc\n");
  });

  it("keeps json.dumps's key order and number forms, which a parsed object loses", () => {
    // Expected output printed by Python 3.12's json.dumps(json.loads(...)).
    expect(
      pyJsonRedump(
        '{"b": 1, "10": 1.0, "a": [1e16, 0.00001, -0, 1.5e300, 123456789012345678, 1E2, -0.0, 2.50], "b": 2}',
      ),
    ).toBe(
      '{"b": 2, "10": 1.0, "a": [1e+16, 1e-05, 0, 1.5e+300, 123456789012345678, 100.0, -0.0, 2.5]}',
    );
    expect(pyJsonRedump("[0.0001, 123.456, 1e15]")).toBe("[0.0001, 123.456, 1000000000000000.0]");
  });

  it("quotes URLs as urllib.parse.quote does", () => {
    expect(pyQuote("a b/c~d")).toBe("a%20b/c~d");
    expect(pyQuote("아")).toBe("%EC%95%84");
  });

  it("collects text as BeautifulSoup's get_text(strip=True) does", () => {
    const $ = parseHtml(
      "<div> a <b>b</b><!-- c --><script>d()</script><style>.e{}</style><template>f</template>\n g </div>",
    );
    expect(getText($("div")[0]!, "|")).toBe("a|b|g");
  });
});

describe("capture clock", () => {
  const at = new Date("2026-09-27T22:05:09Z");

  it("formats local times at the given offset", () => {
    expect(isoLocal(at, () => 120)).toBe("2026-09-28T00:05:09+02:00");
    expect(isoLocal(at, () => -270)).toBe("2026-09-27T17:35:09-04:30");
    expect(headerStamp(at, () => 120)).toBe("2026-09-28T00:05:09+0200");
    expect(localDate(at, () => 120)).toBe("2026-09-28");
    expect(localMinute(at, () => 540)).toBe("2026-09-28 07:05");
  });

  it("turns header stamps into ledger times", () => {
    expect(isoFromHeader("2026-09-27T16:45:36+0200")).toBe("2026-09-27T16:45:36+02:00");
    expect(isoFromHeader("2026-09-27T16:45:36+02:00")).toBe("2026-09-27T16:45:36+02:00");
    expect(isoFromHeader("2026-09-27T16:45:36Z")).toBe("2026-09-27T16:45:36+00:00");
    expect(isoFromHeader("2026-09-27 16:45")).toBeNull();
  });
});
