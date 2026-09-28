/**
 * `@crumble/capture`: the capture ledger and the scrapers that write
 * research records' evidence. Pure I/O: HTTP, HTML, files and the ledger;
 * nothing from `apps/*`. Each scraper is a namespace, since their parsers
 * share names.
 *
 * @module
 */
export * from "./backfill";
export * from "./commands";
export * from "./context";
export * from "./html";
export * from "./http";
export * from "./ledger";
export * from "./text";
export * from "./time";
export * as crumbgg from "./crumbgg";
export * as dc from "./dc";
export * as media from "./media";
export * as naver from "./naver";
export * as youtube from "./youtube";
