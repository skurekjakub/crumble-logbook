// Derives this round's web comparisons from the captures in ../03-sites and the earlier rounds.
// usage (from the record folder): node evidence/r2026-10-07/06-derived/derive_web_r2026-10-07.mjs
// writes: evidence/r2026-10-07/06-derived/crumbgg-diff-r2026-10-07.json
//         evidence/r2026-10-07/06-derived/rift-ranking-2026-10-07.tsv
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const EV = "evidence";
const NEW = `${EV}/r2026-10-07/03-sites`;
const OUT = `${EV}/r2026-10-07/06-derived`;
const json = (p) => JSON.parse(readFileSync(p, "utf8"));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const iso = (ms) => new Date(ms).toISOString();

/** Lists the indices (as 1-based levels from `first`) where two arrays differ. */
function arrayDiff(a, b, first = 1) {
  const out = [];
  for (let i = 0; i < Math.max(a?.length ?? 0, b?.length ?? 0); i++) {
    if (!same(a?.[i], b?.[i])) out.push({ level: first + i, old: b?.[i] ?? null, new: a?.[i] ?? null });
  }
  return out;
}

// ---- stages.json
const stagesOld = `${EV}/03-sites/crumbgg_data_stages.json`;
const stagesNew = `${NEW}/data-stages.json`;
const stagesV15 = json(`${NEW}/data-stages_v15.json`);
const stagesCur = json(stagesNew);
const per = stagesCur.per;
const stageName = (i) => `${Math.floor(i / per) + 1}-${(i % per) + 1}`;
let changedExisting = 0;
for (let i = 0; i < stagesCur.cp.length; i++) if (stagesCur.cp[i] !== stagesV15.cp[i]) changedExisting++;
const focOld = new Map(stagesCur.foc.map(([k, v]) => [k, v]));
const focNewOnly = stagesV15.foc.filter(([k, v]) => focOld.get(k) !== v);

// ---- rift.json
const riftOld = json(`${EV}/r2026-10-03/03-sites/data-rift.json`);
const riftCur = json(`${NEW}/data-rift.json`);
const riftV15 = json(`${NEW}/data-rift_v15.json`);
const bossAlias = { "Cake Hound": "Cake Hound Pack", "Choco Cream Wolf Princess": "Choco Werehound Princess", "Rampage Gang Truck": "Rowdy Truck" };

function setDiff(a, b, label) {
  const out = {};
  for (const s of Object.keys(a.sets)) {
    const first = a.sets[s].rows[0];
    const fields = {};
    for (const f of new Set([...Object.keys(a.sets[s]), ...Object.keys(b.sets[s] ?? {})])) {
      const x = a.sets[s][f];
      const y = b.sets[s]?.[f];
      if (same(x, y)) continue;
      if (y === undefined) { fields[f] = "new field"; continue; }
      if (f === "boss") {
        const renamed = [], changed = [];
        x.forEach((n, i) => {
          const o = y[i];
          if (o === n) return;
          if ((bossAlias[o] ?? o) === n) renamed.push(first + i); else changed.push({ level: first + i, old: o, new: n });
        });
        fields[f] = { renamed_only_levels: renamed.length, changed };
        continue;
      }
      if (Array.isArray(x) && Array.isArray(y) && typeof x[0] === "number") {
        const d = arrayDiff(x, y, first);
        const ratios = d.map((e) => e.new / e.old);
        fields[f] = { levels_changed: d.length, ratio_min: Math.min(...ratios), ratio_max: Math.max(...ratios), first: d.slice(0, 3), last: d.slice(-2) };
        continue;
      }
      fields[f] = { old: y, new: x };
    }
    out[s] = { rows: a.sets[s].rows, fields };
  }
  return { compared: label, sets: out };
}

const topLevel = (a, b) => Object.fromEntries(Object.keys(a).filter((k) => k !== "sets").map((k) => [k, same(a[k], b[k]) ? "same" : "changed"]));

const set2 = riftCur.sets["2"];
const cycle = set2.boss.slice(0, 6).map((n, i) => ({ slot: i + 1, boss_en: n, boss_ko: set2.boss_ko[i], bossId: set2.bossId[i] }));
const set1cycle = riftCur.sets["1"].boss.slice(0, 5).map((n, i) => ({ slot: i + 1, boss_en: n, boss_ko: riftCur.sets["1"].boss_ko[i], bossId: riftCur.sets["1"].bossId[i] }));
const pct = (cp, f) => Math.ceil(cp * f);
const powerRows = (set, levels) => levels.map((lv) => {
  const i = lv - set.rows[0];
  return { level: lv, boss_en: set.boss[i], recommended_power: set.cp[i], power_for_35: pct(set.cp[i], 0.4), power_for_15: pct(set.cp[i], 0.2) };
});

// curated rift-levels.json check (its recommended_power for 1-200 vs rift.json 1.4.002 and v15)
const curated = json("curated/rift-levels.json");
const curByLevel = new Map(curated.levels.map((l) => [l.level, l.recommended_power]));
let curatedVsCur = 0, curatedVsV15 = 0;
for (const s of ["1", "2"]) {
  riftCur.sets[s].cp.forEach((cp, i) => { if (curByLevel.get(riftCur.sets[s].rows[0] + i) !== cp) curatedVsCur++; });
  riftV15.sets[s].cp.forEach((cp, i) => { if (curByLevel.get(riftV15.sets[s].rows[0] + i) !== cp) curatedVsV15++; });
}

// ---- patches.json
const patches = json(`${NEW}/data-patches.json`);
const patchesOld = json(`${EV}/03-sites/crumbgg_data_patches_v5.json`);
// the 2026-09-28 file has no ids: match entries by date
const oldByDate = new Map((patchesOld.updates ?? []).map((u) => [u.date, u]));
const sectionText = (u) => (u.sections ?? []).map((s) => ({ key: s.key, items: (s.items ?? []).map((it) => it.t?.en ?? JSON.stringify(it)) }));
const newUpdates = (patches.updates ?? []).filter((u) => !u.date || !oldByDate.has(u.date)).map((u) => ({ id: u.id, date: u.date || null, version: u.version, upcoming: u.upcoming ?? false, maint_start: u.maint_start ?? null, maint_end: u.maint_end ?? null, title_en: u.title?.en, title_ko: u.title?.ko, cookies: (u.cookies ?? []).map((c) => `${c.name?.en ?? c.key} / ${c.name?.ko ?? ""} (${c.rar} ${c.el} ${c.role})`), sections: sectionText(u) }));
const changedOldEntries = (patches.updates ?? []).filter((u) => u.date && oldByDate.has(u.date) && !same(sectionText(u), sectionText(oldByDate.get(u.date)))).map((u) => u.date);

// ---- crumblehub clear decks
function loadDecks(dir) {
  const decks = [];
  for (let k = 1; k <= 60; k++) {
    const f = `${dir}/crumblehub_api_clear-decks_stage_p${String(k).padStart(2, "0")}.json`;
    if (!existsSync(f)) break;
    decks.push(...json(f).decks);
  }
  return decks;
}
const decksOld = loadDecks(`${EV}/03-sites`);
const decksNew = loadDecks(NEW);
const oldDeckIds = new Set(decksOld.map((d) => d.id));
const newDeckIds = new Set(decksNew.map((d) => d.id));
const addedDecks = decksNew.filter((d) => !oldDeckIds.has(d.id)).map((d) => ({ id: d.id, stage: d.stage, deckName: d.deckName, createdAt: d.createdAt, cookies: d.cookies, pets: d.pets, captainSlot: d.captainSlot, recommendations: d.recommendations, score: d.score }));

// ---- byte-identical recaptures
const identical = [
  ["data-stages.json", `${EV}/03-sites/crumbgg_data_stages.json`],
  ["crumblehub_stages_ko.html", `${EV}/03-sites/crumblehub_stages_ko.html`],
  ["crumblehub_stages_en.html", `${EV}/03-sites/crumblehub_stages_en.html`],
  ["crumblehub_guides_stage_ko.html", `${EV}/03-sites/crumblehub_guides_stage_ko.html`],
  ["crumblehub_data_stage-boss-index-v2.json", `${EV}/03-sites/crumblehub_data_stage-boss-index-v2.json`],
  ["sugarpocket_stages.html", `${EV}/03-sites/sugarpocket_stages.html`],
  ["sugarpocket_api_decks.json", `${EV}/03-sites/sugarpocket_api_decks.json`],
].map(([n, o]) => ({ new: `${NEW}/${n}`.replace(`${EV}/`, "evidence/"), previous: o.replace(`${EV}/`, "evidence/"), byte_identical: sha(`${NEW}/${n}`) === sha(o) }));

// sugarpocket stage snapshot, ignoring generatedAt
const snap = (p) => readFileSync(p, "utf8").match(/<script id="public-stage-snapshot" type="application\/json">([^<]*)/)[1].replace(/"generatedAt":"[^"]*"/, "");
const sugarSnapSame = snap(`${NEW}/sugarpocket_stages.html`) === snap(`${EV}/03-sites/sugarpocket_stages.html`);
const sp = (p) => json(p).decks;
const spOldIds = new Set(sp(`${EV}/03-sites/sugarpocket_api_decks.json`).map((d) => d.id));
const spAdded = sp(`${NEW}/sugarpocket_api_decks.json`).filter((d) => !spOldIds.has(d.id)).map((d) => ({ id: d.id, title: d.title, purpose: d.purpose, cookieIds: d.cookieIds, petIds: d.petIds, createdAt: d.createdAt, tier: d.tier }));
const spDim = readFileSync(`${NEW}/sugarpocket_dimension.html`, "utf8");
const spDimSnap = JSON.parse(spDim.match(/<script id="endgame-snapshot" type="application\/json">([\s\S]*?)<\/script>/)[1]);
let spVsCur = 0;
spDimSnap.dimension.stages.forEach((s) => { const set = s.order <= 100 ? "1" : "2"; if (riftCur.sets[set].cp[(s.order - 1) % 100] !== s.recommendedPower) spVsCur++; });

// ---- rift ranking
const board = json(`${NEW}/pub-live-dimension_stage.json`);
const hist = json(`${NEW}/pub-live-history-dimension_stage-168h.json`);
const lb = json(`${NEW}/pub-leaderboard.json`);
const lbByKey = new Map(lb.players.map((p) => [`${p.name}\u0000${p.guild}`, p]));
const firstPoint = hist.points[0];
const lastPoint = hist.points[hist.points.length - 1];
const firstLevel = new Map(firstPoint.rows.map(([id, , score]) => [id, score]));
const rows = board.rows.map((r) => {
  const p = lbByKey.get(`${r.name}\u0000${r.guild}`);
  return [r.rank, r.name, r.guild, r.score, firstLevel.get(r.id) ?? "", p ? p.cp : "", p ? p.rank : "", p ? p.level : "", r.id];
});
const tsvHeader = [
  `# crumb.gg Dimensional Rift board (pub/live?board=dimension_stage), season ${board.season?.season}, fetched_at ${iso(board.fetched_at * 1000)}.`,
  `# level_reached = the board's score ("STAGE" column on crumb.gg/rankings#rift). level_at_${iso(firstPoint.ts).slice(0, 16)}Z = the same player's score in the first point of pub/live-history (168h).`,
  `# total_power = crumb.gg Total Power leaderboard cp (pub/leaderboard, top 500), joined on name+guild; it is account/lobby power, NOT the in-Rift header power; blank = not in the top 500. The board shows no teams and no Rift header power.`,
  ["rank", "player", "guild", "level_reached", `level_at_${iso(firstPoint.ts).slice(0, 16)}Z`, "total_power_lobby", "total_power_rank", "account_level", "crumbgg_id"].join("\t"),
];
writeFileSync(`${OUT}/rift-ranking-2026-10-07.tsv`, [...tsvHeader, ...rows.map((r) => r.join("\t"))].join("\n") + "\n");

const levels = board.rows.map((r) => r.score);
const dist = {};
for (const l of levels) dist[l] = (dist[l] ?? 0) + 1;
const histTop = (pt) => ({ at: iso(pt.ts), top1: pt.rows[0]?.[2], rank10: pt.rows[9]?.[2], rank50: pt.rows[49]?.[2], rank100: pt.rows[99]?.[2] });
// daily snapshots of the history
const daily = [];
let lastDay = "";
for (const pt of hist.points) { const d = iso(pt.ts).slice(0, 10); if (d !== lastDay) { daily.push(histTop(pt)); lastDay = d; } }
daily.push(histTop(lastPoint));

const out = {
  about: "Comparisons derived by derive_web_r2026-10-07.mjs from this round's 03-sites captures against the 2026-09-28 (evidence/03-sites) and 2026-10-03 (evidence/r2026-10-03/03-sites) captures. power_for_35 / power_for_15 = ceil(recommended_power x 0.4 / 0.2), the bottom of the 35% and 15% brackets.",
  derived_at: new Date().toISOString(),
  patches_json: {
    url: "https://crumb.gg/data/patches.json",
    result: "HTTP 200 (expected 404 did not happen); ?v=5 and ?v=6 return the same body (same sha256 by curl)",
    top_entry: { id: patches.updates?.[0]?.id, date: patches.updates?.[0]?.date, version: patches.updates?.[0]?.version, upcoming: patches.updates?.[0]?.upcoming, maint_start: patches.updates?.[0]?.maint_start, maint_end: patches.updates?.[0]?.maint_end, title: patches.updates?.[0]?.title },
    updates_not_in_2026_09_28_capture: newUpdates,
    entries_in_both_whose_section_text_changed: changedOldEntries,
    entries_in_both_note: "checked by hand on 2026-10-07: wording edits only (2026-09-23 Guild Conquest reward line 'unranked' -> '5th'; 2026-08-27 and 2026-08-13 'level' -> 'stage', 'Grand Master' -> 'Grandmaster', star ranges spelled out); no number changed",
    rift_relevant: "v1-4-hotfix (undated, version 1.4.002): Cool Mint Cookie (Dimensional Rift boss) base HP 800 -> 900 (+12.5%); Rift boss summons count for Summon Bosses missions. v1-5-002: max cookie level 100 -> 120, Cookie EXP for Lv. 79-100 lowered, main stages to 364-30, Dimension Fragment Exchange limits Chocosteel x5 5 -> 10 and Metal Syrup x2 5 -> 10. No Rift entry in v1-5-002's sections.",
  },
  stages_json: {
    vs_2026_09_28: "byte-identical (game data 1.4.002, made 2026-09-23): no recommended power, bracket table, accuracy or focus change",
    stages_v15: {
      file: "evidence/r2026-10-07/03-sites/data-stages_v15.json",
      version: stagesV15.v, made: stagesV15.made,
      dmg_bracket_table_same: same(stagesV15.dmg, stagesCur.dmg),
      existing_stages_changed: changedExisting,
      stage_count: { "1.4.002": stagesCur.cp.length, "1.5.002": stagesV15.cp.length },
      new_stages: `${stageName(stagesCur.cp.length)} to ${stageName(stagesV15.cp.length - 1)}`,
      new_stage_power: { first: { stage: stageName(stagesCur.cp.length), recommended_power: stagesV15.cp[stagesCur.cp.length] }, last: { stage: stageName(stagesV15.cp.length - 1), recommended_power: stagesV15.cp[stagesV15.cp.length - 1] } },
      acc_table_same: same(stagesV15.acc, stagesCur.acc),
      foc_entries_added: focNewOnly.length,
    },
  },
  rift_json: {
    vs_2026_10_03: {
      version: { old: riftOld.v, new: riftCur.v }, made: { old: riftOld.made, new: riftCur.made },
      top_level: topLevel(riftCur, riftOld),
      ...setDiff(riftCur, riftOld, "data-rift.json 2026-10-07 vs 2026-10-03"),
      summary: "Same game data (1.4.002): dmg brackets, 차원의 힘 levels (levels[]), idle gain, fragments, keys, season dates and ranking rewards are unchanged, and every recommended power (cp), acc, foc, bossHp and exp is unchanged in both sets. Changes: boss names now come from the game's Monster names (renames only for levels 1-100), set 2 gains a fifth boss in each cycle, new per-set fields (critRes, boss_ko, bossId, bossN, time, fragments, idle, key, key_ko) and _notes.",
    },
    season2_carried: {
      group: "1403276063 = levels 101-200 (sets['2'].rows " + JSON.stringify(riftCur.sets["2"].rows) + ")",
      already_in_2026_10_03_capture: true,
      differs_from_season1: true,
      boss_cycle_season1: set1cycle,
      boss_cycle_season2: cycle,
      note: "Season 2 cycles six bosses, not five: slot 5 is a new boss 'Well-Aged Archangel' (숙성의 대천사, bossId 1887208137) and GingerCraven (비겁한 쿠키) moves to every sixth level (106, 112, ...). The 2026-10-03 capture had an empty name in that slot.",
      recommended_power_season1_vs_season2_1_4_002: { level1: riftCur.sets["1"].cp[0], level101: riftCur.sets["2"].cp[0], ratio: riftCur.sets["2"].cp[0] / riftCur.sets["1"].cp[0] },
      idle_and_fragments_same_as_season1_in_1_4_002: same(riftCur.sets["1"].idle, riftCur.sets["2"].idle) && same(riftCur.sets["1"].fragments, riftCur.sets["2"].fragments),
    },
    rift_v15: {
      file: "evidence/r2026-10-07/03-sites/data-rift_v15.json (crumb.gg's 'riftNext' file for update v1-5-002)",
      version: riftV15.v, made: riftV15.made,
      top_level_vs_current: topLevel(riftV15, riftCur),
      ...setDiff(riftV15, riftCur, "data-rift_v15.json (1.5.002) vs data-rift.json (1.4.002), both 2026-10-07"),
      seasons_v15: riftV15.seasons.slice(0, 4).map((s) => ({ n: s.n, from: iso(s.from), to: iso(s.to), set: s.set })),
      seasons_current: riftCur.seasons.slice(0, 4).map((s) => ({ n: s.n, from: iso(s.from), to: iso(s.to), set: s.set })),
      season2_power_lines_1_5_002: powerRows(riftV15.sets["2"], [101, 102, 103, 104, 105, 106, 110, 112, 115, 118, 120, 125, 130]),
      season2_power_lines_1_4_002: powerRows(riftCur.sets["2"], [101, 106, 110, 118, 120]),
      summary: "In 1.5.002 season 2 (levels 101-200) recommended power is x1.4478 of the 1.4.002 figures at every level (101: 24.20G vs 16.72G), focus (foc) and boss HP multipliers rise slightly, clear rewards change (fragments 170-400 with 0 every fifth level; new key rewards at 5/15/25/... levels). Set 1, 차원의 힘 levels, idle gain, the damage brackets and the boss cycle are unchanged. The v15 seasons table gives season 1 end 2026-10-02T01:30Z and season 2 start 2026-10-02T03:30Z, which contradicts the current file and the 10-08 patch; recorded as the file shows it.",
    },
    curated_rift_levels_json: { mismatches_vs_1_4_002: curatedVsCur, mismatches_vs_1_5_002: curatedVsV15, note: "curated/rift-levels.json matches 1.4.002 for all 200 levels; its levels 101-200 would be stale if 1.5.002 values apply in season 2." },
  },
  rift_ranking: {
    file: "evidence/r2026-10-07/06-derived/rift-ranking-2026-10-07.tsv",
    board_fetched_at: iso(board.fetched_at * 1000),
    season: board.season,
    shows: "rank, player, guild, level reached; no teams, no power",
    top_levels: board.rows.slice(0, 5).map((r) => ({ rank: r.rank, name: r.name, guild: r.guild, level: r.score })),
    rank10_level: board.rows[9]?.score, rank50_level: board.rows[49]?.score, rank100_level: board.rows[99]?.score,
    level_distribution_top100: dist,
    history_daily: daily,
  },
  crumblehub: {
    clear_deck_api_modes: "the page code knows stage, arena, daily_dungeon, implant_tower, guild_raid; mode=rift / dimension / dimension_stage / dimensional_rift answer HTTP 400 {\"error\":\"Invalid mode\"}",
    stage_clear_decks: { previous_total: decksOld.length, now_total: decksNew.length, added: addedDecks, removed: decksOld.filter((d) => !newDeckIds.has(d.id)).length, verdict: "no material change" },
  },
  sugarpocket: {
    stage_snapshot_same_except_generatedAt: sugarSnapSame,
    decks_added: spAdded,
    dimension_page: { file: "evidence/r2026-10-07/03-sites/sugarpocket_dimension.html", gameVersion: spDimSnap.gameVersion, stages: spDimSnap.dimension.stages.length, recommended_power_mismatches_vs_crumbgg_1_4_002: spVsCur, note: "new page (planner: recommended power, 차원의 힘 stats, season schedule); 1.4.002 data, no teams" },
  },
  recaptures: identical,
};
writeFileSync(`${OUT}/crumbgg-diff-r2026-10-07.json`, JSON.stringify(out, null, 1) + "\n");
console.log("wrote", `${OUT}/crumbgg-diff-r2026-10-07.json`, `${OUT}/rift-ranking-2026-10-07.tsv`);
