/**
 * The sections outside any game mode.
 *
 * @module
 */
import type { SharedSection } from "./types";

/** Sections shared by every mode, in tab order after the modes. */
export const SHARED_SECTIONS: readonly SharedSection[] = [
  {
    id: "account",
    kind: "shared",
    label: "Account",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/account",
    link: { to: "/account" },
    recordSlug: null,
    lede: null,
    stamp: [],
    tabs: [],
  },
  {
    id: "research",
    kind: "shared",
    label: "Research",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/research",
    link: { to: "/research" },
    recordSlug: null,
    lede: null,
    stamp: [],
    tabs: [],
  },
  {
    id: "sources",
    kind: "shared",
    label: "Sources",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/sources",
    link: { to: "/sources" },
    recordSlug: null,
    lede: null,
    stamp: ["sources"],
    tabs: [],
  },
  {
    id: "glossary",
    kind: "shared",
    label: "Glossary",
    labelKr: null,
    title: "Crumble Logbook",
    to: "/glossary",
    link: { to: "/glossary" },
    recordSlug: null,
    lede: null,
    stamp: [],
    tabs: [],
  },
];
