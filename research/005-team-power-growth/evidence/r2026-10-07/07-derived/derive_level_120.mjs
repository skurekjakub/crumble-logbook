// Derives level-120.json: what the 2026-10-08 cap raise (100 → 120) and the Lv.79–100 EXP cut do,
// from the round's captures and the first round's game-data level curve.
//
// Inputs (record-relative):
//   evidence/r2026-10-07/04-sites/data-patches.json   crumb.gg's patch digest, with update 1.5.002 (upcoming)
//   evidence/07-derived/level-curve.json              the 1.4.002 level curve (stat % and EXP per level to 100)
//   evidence/07-derived/star-growth.json              star growth by grade (ATK/HP % and DEF % at 10★)
//   evidence/r2026-10-07/03-naver/nv/nv-50417.md       the official 10-08 notes, with the new EXP per level 79–100
//
// Run from the record folder: node evidence/r2026-10-07/07-derived/derive_level_120.mjs
import { readFileSync, writeFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const patches = read("evidence/r2026-10-07/04-sites/data-patches.json");
const curve = read("evidence/07-derived/level-curve.json");
const stars = read("evidence/07-derived/star-growth.json");
const notes = readFileSync("evidence/r2026-10-07/03-naver/nv/nv-50417.md", "utf8");

const star10 = (grade) => stars.grades[grade].stars.find((s) => s.star === 10);
const multiplier = (pct) => 1 + pct / 100;

// A cookie's shown stats are base × level multiplier × star multiplier (ATK/HP; DEF has its own star %).
const cookieRow = (update, key) => update.rich.cookies.find((c) => c.key === key);
const update = (id) => patches.updates.find((u) => u.id === id);
const lvl100 = curve.levels.find((l) => l.level === 100);
const levelMult100 = multiplier(lvl100.stat_pct);

const check = (() => {
  const bari = cookieRow(update("2026-09-23"), "cookie0081");
  const s = star10(bari.rarity);
  return {
    cookie: bari.name.en,
    rarity: bari.rarity,
    level: bari.top.level,
    grade: bari.top.grade,
    base: bari.base,
    top: bari.top,
    level_multiplier_implied: {
      atk: +(bari.top.atk / bari.base.atk / multiplier(s.atk_hp_pct)).toFixed(3),
      def: +(bari.top.def / bari.base.def / multiplier(s.def_pct)).toFixed(3),
      hp: +(bari.top.hp / bari.base.hp / multiplier(s.atk_hp_pct)).toFixed(3),
    },
    level_multiplier_game_data: +levelMult100.toFixed(3),
  };
})();

const chardonnay = (() => {
  const c = cookieRow(update("v1-5-002"), "cookie4011");
  const s = star10(c.rarity);
  const m = {
    atk: c.top.atk / c.base.atk / multiplier(s.atk_hp_pct),
    def: c.top.def / c.base.def / multiplier(s.def_pct),
    hp: c.top.hp / c.base.hp / multiplier(s.atk_hp_pct),
  };
  const mean = (m.atk + m.def + m.hp) / 3;
  return {
    cookie: c.name.en,
    rarity: c.rarity,
    level: c.top.level,
    grade: c.top.grade,
    base: c.base,
    top: c.top,
    level_multiplier_implied: { atk: +m.atk.toFixed(3), def: +m.def.toFixed(3), hp: +m.hp.toFixed(3) },
    stat_pct_at_120_implied: +((mean - 1) * 100).toFixed(1),
    gain_120_over_100_pct: +((mean / levelMult100 - 1) * 100).toFixed(1),
  };
})();

// The new EXP per level, as the notes list it: "Lv.79 : 기존 625,666 ➔ 571,791".
const expRows = [...notes.matchAll(/Lv\.(\d+) : 기존 ([\d,]+) ➔ ([\d,]+)/g)].map((m) => ({
  level: Number(m[1]),
  old: Number(m[2].replaceAll(",", "")),
  new: Number(m[3].replaceAll(",", "")),
}));
const sum = (k) => expRows.reduce((a, r) => a + r[k], 0);
const to78 = curve.levels.find((l) => l.level === 78).exp_cumulative;
const oldMatches = expRows.every((r) => curve.levels.find((l) => l.level === r.level).exp_for_level === r.old);

const out = {
  about:
    "What the 2026-10-08 update does to cookie levels, derived before it lands. Stats: crumb.gg's digest of update 1.5.002 lists the new SSR Chardonnay at level 120, 10★; dividing its shown stats by its base stats and its 10★ multiplier gives the level-120 multiplier, checked against Princess Bari at level 100, 10★ (which the same method returns as the game data's level-100 multiplier). EXP: the official notes' new costs for levels 79–100. Inferred, not posted: no player has a level-120 cookie yet, and team power also counts gear, Resolve and amplifications, so a cookie's +% stats is an upper bound on its team-power gain.",
  sources: {
    stats: "evidence/r2026-10-07/04-sites/data-patches.json (crumb.gg, updates v1-5-002 and 2026-09-23)",
    level_curve: "evidence/07-derived/level-curve.json (game data 1.4.002)",
    star_growth: "evidence/07-derived/star-growth.json",
    exp: "evidence/r2026-10-07/03-naver/nv/nv-50417.md (official notes, nv:50417)",
  },
  method_check: check,
  level_120: chardonnay,
  exp_79_100: {
    rows: expRows,
    old_matches_game_data: oldMatches,
    old_total_79_100: sum("old"),
    new_total_79_100: sum("new"),
    cut_pct: +((1 - sum("new") / sum("old")) * 100).toFixed(1),
    cumulative_to_100_old: to78 + sum("old"),
    cumulative_to_100_new: to78 + sum("new"),
    note: "EXP spent past the new costs is refunded by mail (nv:50417). The EXP for levels 101–120 isn't in any capture.",
  },
};
writeFileSync("evidence/r2026-10-07/07-derived/level-120.json", JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify({ check: check.level_multiplier_implied, l120: chardonnay, exp: { ...out.exp_79_100, rows: undefined } }, null, 1));
