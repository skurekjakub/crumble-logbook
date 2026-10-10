// Counts, on round 2026-10-10's Rumble top 100, the teams that fit each named 12:
// "fits" = every revealed cookie belongs to the 12 (an upper bound, hidden slots allowed);
// "exact" = all twelve revealed and equal to it. Usage: node crumbgg-cores.mjs <03-sites>
import { readFileSync } from "node:fs";
const dir = process.argv[2];
const J = (f) => JSON.parse(readFileSync(`${dir}/${f}`, "utf8"));
const meta = J("data-meta.json");
const id = (prefix) => meta.cookies.find((c) => c.name.startsWith(prefix)).id;
const base = ["Oven Wanderer", "Pinot Noir", "Cheesecake", "Pomegranate", "Princess Bari", "Milk Cookie's Crunchy", "Nameless Cake Hound", "Ion Cookie Robot", "Cherry Cola", "Moon Rabbit Cookie's Pampered"];
const teams = {
  "Chardonnay 12 (Herb)": [...base, "Chardonnay", "Herb"],
  "Chardonnay 12 (Rockstar)": [...base, "Chardonnay", "Rockstar"],
  "Macaron standard 12 (Herb)": [...base, "Macaron", "Herb"],
};
const live = J("pub-live-rumble_arena.json");
console.log(`board fetched ${new Date(live.fetched_at * 1000).toISOString()}, ${live.rows.length} teams`);
for (const [label, names] of Object.entries(teams)) {
  const set = new Set(names.map(id));
  const fits = live.rows.filter((r) => r.team.every((c) => set.has(c)));
  const exact = fits.filter((r) => r.team.length === 12);
  const top10 = fits.filter((r) => r.rank <= 10).map((r) => `#${r.rank}`);
  console.log(`${label}: fits ${fits.length}, exact ${exact.length}, top-10 fits ${top10.join(" ") || "none"}`);
}
const chardonnayAny = new Set([...base, "Chardonnay", "Herb", "Rockstar"].map(id));
const either = live.rows.filter((r) => r.team.every((c) => chardonnayAny.has(c)));
console.log(`Chardonnay 12 with Herb or Rockstar: fits ${either.length}, exact ${either.filter((r) => r.team.length === 12).length}`);
