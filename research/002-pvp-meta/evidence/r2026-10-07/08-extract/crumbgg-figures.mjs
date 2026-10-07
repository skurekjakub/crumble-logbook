// Reads round 2026-10-07's crumb.gg captures and prints the figures the round curates:
// meta-page lineups, cookie/pet shares and 7-day moves per mode; top-100 stats; top-10 grids.
import { readFileSync } from "node:fs";
const dir = process.argv[2];
const old = process.argv[3];
const J = (f) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
const meta = J("data-meta.json");
const name = new Map();
for (const c of meta.cookies) name.set(c.id, `${c.name.replace(/ Cookie$/, "")}(${c.range})`);
for (const p of meta.pets) name.set(p.id, p.name);
for (const p of meta.perks) name.set(p.id, p.name);
const n = (id) => (id === null ? "·" : name.get(id) ?? String(id));
const mp = J("crumbgg_pub-meta-page.json");
console.log("meta-page updated", new Date(mp.modes.arena.updated).toISOString(), new Date(mp.modes.rumble.updated).toISOString());
for (const mode of ["arena", "rumble"]) {
  const m = mp.modes[mode];
  console.log(`\n##### ${mode}`);
  for (const kind of ["grouped", "lineups"]) {
    console.log(`-- ${kind}`);
    for (const l of m[kind].slice(0, 8))
      console.log(
        `${(l.share * 100).toFixed(1)}% 7d ${(l.chg?.["7d"] * 100).toFixed(1)} | ${l.grid.map(n).join(", ")} | pets ${l.pets.map(n).join(", ")} | cap ${n(l.captain)} | perks ${l.perks.map(n).join(" + ")}`,
      );
  }
  console.log("-- cookies");
  console.log(m.cookies.slice(0, 26).map(([id, s]) => `${n(id)} ${(s * 100).toFixed(1)} (7d ${((m.moves["7d"]?.cookies?.[id] ?? 0) * 100).toFixed(1)})`).join("; "));
  console.log("-- pets");
  console.log(m.pets.slice(0, 8).map(([id, s]) => `${n(id)} ${(s * 100).toFixed(1)}`).join("; "));
  console.log("moves keys", Object.keys(m.moves));
}
const st = J("pub-stats.json");
console.log(`\n##### stats teams ${st.teams} revealed ${st.revealed} concealed ${st.concealed} at ${new Date(st.fetched_at * 1000).toISOString()}`);
let prev = new Map();
if (old) {
  const o = JSON.parse(readFileSync(old, "utf8"));
  prev = new Map([...o.cookies, ...o.pets].map((c) => [c.id, c.n]));
}
console.log(st.cookies.map((c) => `${n(c.id)} ${c.n} (was ${prev.get(c.id) ?? 0})`).join("; "));
console.log(st.pets.map((c) => `${n(c.id)} ${c.n} (was ${prev.get(c.id) ?? 0})`).join("; "));
const live = J("pub-live-rumble_arena.json");
console.log(`\n##### live season ${JSON.stringify(live.season)} fetched ${new Date(live.fetched_at * 1000).toISOString()}`);
for (const r of live.rows.slice(0, 20))
  console.log(`${r.rank} ${r.name} ${r.score} | ${r.grid.map(n).join(", ")} | ${r.pets.map(n).join(", ")}`);
const rows = live.rows;
const has = (r, id) => r.team.includes(id);
const ids = Object.fromEntries(meta.cookies.map((c) => [c.name.replace(/ Cookie$/, ""), c.id]));
const std = ["Macaron", "Oven Wanderer", "Pinot Noir", "Cheesecake", "Pomegranate", "Princess Bari", "Pediatrician Milk", "Cake Hound", "Ion Robot", "Cherry Cola", "Herb", "Moon Rabbit"];
console.log("ids for std", std.map((s) => `${s}=${ids[s] ?? Object.keys(ids).find((k) => k.includes(s.split(" ")[0]))}`).join(" "));
const full = rows.filter((r) => r.team.length === 12);
console.log(`fully revealed ${full.length}`);
for (const r of full) console.log(`  #${r.rank} ${r.team.map(n).join(", ")}`);
const pets = new Map();
for (const r of rows) { const k = r.pets.map(n).sort().join(" + "); pets.set(k, (pets.get(k) ?? 0) + 1); }
console.log("pet sets", [...pets].sort((a, b) => b[1] - a[1]).slice(0, 6));
