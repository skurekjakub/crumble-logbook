import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { keysFromMeta, keysFromSnapshot, iconUrl } from "../scripts/fetch-icons";
import { AtkOrder } from "../src/components/AtkOrder";
import { CookieIcon, IconIndexContext } from "../src/components/CookieIcon";
import { CookieName } from "../src/components/CookieName";
import { LineupSlot } from "../src/components/Lineup";
import type { IconGlossaryEntry } from "../src/lib/cookie-icons";
import {
  buildIconIndex,
  elementOf,
  iconSrc,
  initials,
  lookupIcon,
  resourceKey,
  shortName,
} from "../src/lib/cookie-icons";

/** Glossary rows as `/api/glossary` returns them, trimmed to what the index reads. */
const GLOSSARY: IconGlossaryEntry[] = [
  {
    kr: "우유맛 쿠키",
    en: "Milk Cookie",
    kind: "cookie",
    shorthand: ["우유"],
    element: "빛/Light",
    extra: { resource_key: "cookie0101" },
  },
  {
    kr: "바리공주",
    en: "Princess Bari Cookie",
    kind: "cookie",
    shorthand: ["바궁"],
    element: "물/Water",
    extra: { resource_key: "cookie4040" },
  },
  {
    kr: "바람궁수",
    en: "Wind Archer Cookie",
    kind: "cookie",
    shorthand: ["바궁"],
    element: "풀/Grass",
    extra: { resource_key: "cookie0050" },
  },
  {
    kr: "레디베리 쿠키",
    en: null,
    kind: "cookie",
    shorthand: [],
    element: "불/Fire",
    extra: {},
  },
  {
    kr: "와사비문어",
    en: "Octo Wasabi",
    kind: "pet",
    shorthand: [],
    element: null,
    extra: { resource_key: "pet0007" },
  },
  {
    kr: "15%",
    en: "The 15% bracket",
    kind: "term",
    shorthand: [],
    element: null,
    extra: { resource_key: "cookie9999" },
  },
];

const INDEX = buildIconIndex(GLOSSARY);

/**
 * Renders a node inside the icon index's provider.
 *
 * @param node - what to render
 * @returns the render result
 */
const withIcons = (node: ReactNode) =>
  render(<IconIndexContext value={INDEX}>{node}</IconIndexContext>);

describe("the icon index", () => {
  it("reads only well-formed resource keys", () => {
    expect(resourceKey({ resource_key: "cookie0038" })).toBe("cookie0038");
    expect(resourceKey({ resource_key: "pet4001" })).toBe("pet4001");
    expect(resourceKey({ resource_key: "../evil" })).toBeNull();
    expect(resourceKey(null)).toBeNull();
    expect(resourceKey("cookie0038")).toBeNull();
  });

  it("reads the element from the glossary's bilingual form", () => {
    expect(elementOf("불/Fire")).toBe("fire");
    expect(elementOf("Water")).toBe("water");
    expect(elementOf(null)).toBeNull();
    expect(elementOf("없음")).toBeNull();
  });

  it("finds a name by English first, then by Korean name or shorthand", () => {
    expect(lookupIcon(INDEX, "바궁", "Wind Archer Cookie")?.key).toBe("cookie0050");
    expect(lookupIcon(INDEX, "바궁", null)?.key).toBe("cookie4040");
    expect(lookupIcon(INDEX, "우유", null)?.key).toBe("cookie0101");
    expect(lookupIcon(INDEX, "우유맛 쿠키", "milk cookie")?.element).toBe("light");
    expect(lookupIcon(INDEX, "와사비문어", "Octo Wasabi")?.key).toBe("pet0007");
  });

  it("skips glossary kinds other than cookies and pets", () => {
    expect(lookupIcon(INDEX, "15%", "The 15% bracket")).toBeUndefined();
  });

  it("keeps a cookie the glossary has no key for, for its badge colour", () => {
    expect(lookupIcon(INDEX, "레디베리 쿠키", null)).toEqual({ key: null, element: "fire" });
  });

  it("serves icons from the public icons folder", () => {
    expect(iconSrc("cookie0038")).toBe("/icons/cookie0038.webp");
  });
});

describe("shortName and initials", () => {
  it("drops the trailing Cookie and shortens an alternate form's title", () => {
    expect(shortName("Brightseeker Cookie")).toBe("Brightseeker");
    expect(shortName("Milk Cookie's Crunchy Strong Pediatrician")).toBe("Milk · Pediatrician");
    expect(shortName("Ion Cookie Robot")).toBe("Ion Cookie Robot");
    expect(shortName("Octo Wasabi")).toBe("Octo Wasabi");
  });

  it("abbreviates English to two letters and Korean to one syllable", () => {
    expect(initials("Milk Cookie")).toBe("Mi");
    expect(initials("Moon Rabbit Cookie")).toBe("MR");
    expect(initials("Milk Cookie's Crunchy Strong Pediatrician")).toBe("MP");
    expect(initials("브시커")).toBe("브");
    expect(initials("")).toBe("?");
  });
});

describe("CookieIcon", () => {
  it("shows the portrait the glossary keys", () => {
    const { container } = withIcons(<CookieIcon kr="우유" en="Milk Cookie" size={40} />);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/icons/cookie0101.webp");
    expect(img).toHaveAttribute("alt", "");
    expect(img).toHaveClass("cicon", "s40");
  });

  it("falls back to an element-tinted initials badge when the glossary has no key", () => {
    const { container } = withIcons(<CookieIcon kr="레디베리 쿠키" en={null} />);
    const badge = container.querySelector(".cicon.badge")!;
    expect(badge).toHaveClass("el-fire");
    expect(badge).toHaveAttribute("data-initials", "레");
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img")).toBeNull();
  });

  it("falls back to the badge when the image fails to load", () => {
    const { container } = withIcons(<CookieIcon kr="우유" en="Milk Cookie" />);
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector(".cicon.badge.el-light")).toHaveAttribute("data-initials", "Mi");
  });

  it("shows a plain badge without a provider", () => {
    const { container } = render(<CookieIcon kr="브시커" en={null} />);
    expect(container.querySelector(".cicon.badge")).toHaveAttribute("data-initials", "브");
    expect(container).toHaveTextContent(/^$/);
  });
});

describe("names with portraits", () => {
  it("CookieName shows the portrait, the short name and the full name as tooltip", () => {
    const { container } = withIcons(
      <CookieName kr="우유" en="Milk Cookie's Crunchy Strong Pediatrician" />,
    );
    expect(screen.getByText("Milk · Pediatrician")).toBeVisible();
    expect(container.querySelector(".name-row")).toHaveAttribute(
      "title",
      "Milk Cookie's Crunchy Strong Pediatrician",
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "/icons/cookie0101.webp");
  });

  it("CookieName can leave the portrait out", () => {
    const { container } = withIcons(<CookieName kr="우유" en="Milk Cookie" icon={false} />);
    expect(container.querySelector(".cicon")).toBeNull();
  });

  it("a lineup slot carries the portrait above its level", () => {
    const { container } = withIcons(
      <LineupSlot cookie={{ cookieKr: "우유", en: "Milk Cookie", level: "100", stars: "8" }} />,
    );
    const slot = container.querySelector(".slot")!;
    expect(slot.querySelector(".pic img")).toHaveAttribute("src", "/icons/cookie0101.webp");
    expect(slot.querySelector(".lv")).toHaveTextContent("Lv.100 · 8★");
    expect(slot.querySelector(".nm")).toHaveTextContent(/^Milk$/);
    expect(slot).toHaveAttribute("title", "Milk Cookie");
  });

  it("the ATK order shows a portrait per step", () => {
    const { container } = withIcons(
      <AtkOrder
        order={[
          { kr: "우유", en: "Milk Cookie" },
          { kr: "미확인", en: null },
        ]}
      />,
    );
    const steps = [...container.querySelectorAll(".order .step")];
    expect(steps.map((s) => s.textContent)).toEqual(["Milk", "미확인"]);
    expect(steps[0]!.querySelector("img")).not.toBeNull();
    expect(steps[1]!.querySelector(".cicon.badge")).not.toBeNull();
  });
});

describe("pnpm icons:fetch helpers", () => {
  it("lists crumb.gg's cookie keys and pet icons, dropping malformed ones", () => {
    const meta = {
      cookies: [{ key: "cookie0038" }, { key: "nope" }, { name: "keyless" }],
      pets: [{ icon: "pet0001" }],
    };
    expect(keysFromMeta(meta)).toEqual(["cookie0038", "pet0001"]);
    expect(keysFromMeta(null)).toEqual([]);
    expect(keysFromMeta({ cookies: "x" })).toEqual([]);
  });

  it("lists the keys a snapshot's glossary names", () => {
    const snapshot = {
      tables: {
        glossary: [
          { extra: { resource_key: "cookie4013" } },
          { extra: {} },
          { extra: null },
          { extra: { resource_key: "pet4001" } },
        ],
      },
    };
    expect(keysFromSnapshot(snapshot)).toEqual(["cookie4013", "pet4001"]);
    expect(keysFromSnapshot({})).toEqual([]);
  });

  it("builds crumb.gg's icon URL by the key's kind", () => {
    expect(iconUrl("cookie0038")).toBe("https://crumb.gg/cookies/cookie0038.webp");
    expect(iconUrl("pet0001")).toBe("https://crumb.gg/pets/pet0001.webp");
  });
});
