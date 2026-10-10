// Reads round 2026-10-10's crumb.gg captures and prints the figures the round curates:
// meta-page lineups, cookie/pet shares and moves per mode; top-100 stats against the
// last round's; the Rumble Season 2 top 100, its fully revealed teams and its pet sets.
// Usage: node crumbgg-figures.mjs <this round's 03-sites> <last round's 03-sites>
import { readFileSync } from "node:fs";
const dir = process.argv[2];
const old = process.argv[3];
const J = (d, f) => JSON.parse(readFileSync(`${d}/${f}`, "utf8"));
const meta = J(dir, "data-meta.json");
const name = new Map();
for (const c of meta.cookies) name.set(c.id, `${c.name.replace(/ Cookie$/, "")}(${c.range})`);
for (const p of meta.pets) name.set(p.id, p.name);
for (const p of meta.perks ?? []) name.set(p.id, p.name);
const n = (id) => (id === null ? "·" : name.get(id) ?? String(id));
const pct = (x) => (x === undefined || x === null ? "–" : (x * 100).toFixed(1));

const mp = J(dir, "crumbgg_pub-meta-page.json");
const mpOld = J(old, "crumbgg_pub-meta-page.json");
console.log("meta-page updated", new Date(mp.modes.arena.updated).toISOString(), new Date(mp.modes.rumble.updated).toISOString());
for (const mode of ["arena", "rumble"]) {
  const m = mp.modes[mode];
  const o = mpOld.modes[mode];
  console.log(`\n##### ${mode}`);
  for (const kind of ["grouped", "lineups"]) {
    console.log(`-- ${kind}`);
    for (const l of m[kind].slice(0, 10))
      console.log(
        `${pct(l.share)}% chg ${JSON.stringify(l.chg)} | ${l.grid.map(n).join(", ")} | pets ${l.pets.map(n).join(", ")} | cap ${n(l.captain)} | perks ${l.perks.map(n).join(" + ")}`,
      );
  }
  const oldShare = new Map(o.cookies);
  console.log("-- cookies (share, 10-07 share)");
  console.log(m.cookies.slice(0, 30).map(([id, s]) => `${n(id)} ${pct(s)} (${pct(oldShare.get(id) ?? 0)})`).join("; "));
  const oldPet = new Map(o.pets);
  console.log("-- pets (share, 10-07 share)");
  console.log(m.pets.slice(0, 10).map(([id, s]) => `${n(id)} ${pct(s)} (${pct(oldPet.get(id) ?? 0)})`).join("; "));
  console.log("moves keys", Object.keys(m.moves));
}

const st = J(dir, "pub-stats.json");
const stOld = J(old, "pub-stats.json");
const prev = new Map([...stOld.cookies, ...stOld.pets].map((c) => [c.id, c.n]));
console.log(`\n##### stats teams ${st.teams} revealed ${st.revealed} concealed ${st.concealed} at ${new Date(st.fetched_at * 1000).toISOString()}`);
console.log(`10-07: teams ${stOld.teams} revealed ${stOld.revealed} concealed ${stOld.concealed}`);
console.log(st.cookies.map((c) => `${n(c.id)} ${c.n} (was ${prev.get(c.id) ?? 0})`).join("; "));
console.log(st.pets.map((c) => `${n(c.id)} ${c.n} (was ${prev.get(c.id) ?? 0})`).join("; "));

const live = J(dir, "pub-live-rumble_arena.json");
console.log(`\n##### live season ${JSON.stringify(live.season)} fetched ${new Date(live.fetched_at * 1000).toISOString()}`);
for (const k of ["start", "end", "battle_end"]) if (live.season[k]) console.log(`  ${k} ${new Date(live.season[k]).toISOString()}`);
for (const r of live.rows.slice(0, 30))
  console.log(`${r.rank} ${r.name} ${r.score} | ${r.grid.map(n).join(", ")} | ${r.pets.map(n).join(", ")}`);
const rows = live.rows;
const ids = Object.fromEntries(meta.cookies.map((c) => [c.name.replace(/ Cookie$/, ""), c.id]));
const id = (s) => ids[s] ?? ids[Object.keys(ids).find((k) => k.startsWith(s))];
const std = ["Macaron", "Oven Wanderer", "Pinot Noir", "Cheesecake", "Pomegranate", "Princess Bari", "Milk Cookie's Crunchy", "Nameless Cake Hound", "Ion Cookie Robot", "Cherry Cola", "Herb", "Moon Rabbit Cookie's Pampered"];
console.log("ids", std.map((s) => `${s}=${id(s)}`).join(" "), `Chardonnay=${id("Chardonnay")}`);
const full = rows.filter((r) => r.team.length === 12);
console.log(`fully revealed ${full.length}`);
const lineup = new Map();
const key = (r) => [...r.team].sort().map(n).join(" + ");
for (const r of full) lineup.set(key(r), (lineup.get(key(r)) ?? 0) + 1);
const ranked = [...lineup].sort((a, b) => b[1] - a[1]);
console.log("full lineups", ranked);
const common = new Set(ranked.slice(0, 2).map(([k]) => k));
for (const r of full) if (!common.has(key(r))) console.log(`  other: #${r.rank} ${r.score} ${r.name} ${r.team.map(n).join(", ")} | ${r.pets.map(n).join(", ")}`);
const count = (list) => rows.filter((r) => list.every((c) => r.team.includes(id(c)))).length;
for (const core of [["Princess Bari", "Oven Wanderer"], ["Princess Bari", "Oven Wanderer", "Cherry Cola"], ["Chardonnay"], ["Chardonnay", "Princess Bari"], ["Herb"], ["Rye"], ["Rockstar"], ["Skating Queen"], ["Strawberry Crepe"], ["Vampire"], ["Doughnut King"]])
  console.log(`teams with ${core.join(" + ")}: ${count(core)}`);
const top10 = rows.slice(0, 10);
console.log(`top 10 with Chardonnay ${top10.filter((r) => r.team.includes(id("Chardonnay"))).length}, with Herb ${top10.filter((r) => r.team.includes(id("Herb"))).length}`);
const chPos = new Map();
for (const r of rows) { const i = r.grid.indexOf(id("Chardonnay")); if (i >= 0) chPos.set(i, (chPos.get(i) ?? 0) + 1); }
console.log("Chardonnay grid index (range order, 0 = longest range)", [...chPos].sort((a, b) => a[0] - b[0]));
const missing = new Map();
for (const r of rows) for (const s of std) if (!r.team.includes(id(s))) missing.set(s, (missing.get(s) ?? 0) + 1);
console.log("standard-12 members missing from a team (hidden or swapped)", [...missing].sort((a, b) => b[1] - a[1]));
const pets = new Map();
for (const r of rows) { const k = r.pets.map(n).sort().join(" + "); pets.set(k, (pets.get(k) ?? 0) + 1); }
console.log("pet sets", [...pets].sort((a, b) => b[1] - a[1]).slice(0, 8));
console.log("scores: #1", rows[0].score, "#10", rows[9]?.score, "#50", rows[49]?.score, "#100", rows[99]?.score);
