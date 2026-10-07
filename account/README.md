# account/

The user's own Cookie Run: Crumble account, read from the live game, and the roadmap built from it against `research/`.

- `snapshots/YYYY-MM-DD.json`: everything read on that date. It holds no nickname, UID, guild name or other players' names.
- `snapshots/screens/YYYY-MM-DD/`: the screenshots behind each section, named by what they show, plus `raw/` full-resolution PNGs. Local only; never commit them.
- `roadmap-YYYY-MM-DD.md` and `.json`: the gap analysis and the ordered plan.

## Snapshot shape

Every section carries its own `capturedAt` and a `screens[]` list. Values that weren't read are `null` and are listed in `unread[]`.

| Key | Holds |
|---|---|
| `account` | Level, combat power, header rank, Blessing, Oven |
| `resources` | Gems, coins, rune crystals, tickets, SP and the other currencies read |
| `cookies.list[]` | `en`, `kr` and `resourceKey` (from `research/001-*/curated/glossary.json`), plus level, stars, `skillTier`, power, stats, `runes[]` (grade, stat, value), `promotion` and `usedIn[]` |
| `statPanels` | Full stat panels read in detail |
| `presets[]` | Gear presets: per slot the item, level, enhance, main stat and substats |
| `lineups.{mode}` | Rows by `en`/`kr`/`resourceKey`, plus pets, captain, gear preset, power, and the matching research deck |
| `pets` | Every pet read: stars, companion effect, owned effect, promotion |
| `perks`, `treasures`, `guildResearch`, `build` | Merc perks, Resolve, Fame, Gnome Lab, Stellar Links and guild research |
| `progress` | Stage, Rift, Conquest, Arena, Rumble, Dungeon, tower, rankings |

The roadmap JSON has `items[]` with `priority` (now, next or later), `area`, `action`, `why`, `payoff`, `size` (how big the payoff is: `big`, `medium` or `small`; the app's payoff badge shows it), `cost` and `refs` (a record slug plus a deck `id` or a `file`). It also has `parked[]` and `unread[]`.

## Reading the game (MuMu, adb)

- Set `export MSYS_NO_PATHCONV=1` in Git Bash, or `/sdcard` gets mangled.
- adb is `"/c/Program Files/Netease/MuMuPlayer/nx_main/adb.exe" -s emulator-5556`.
- The game runs on display 2, portrait 1440×2560. Its SurfaceFlinger id is `4619827767814508545`.
- Screenshot: `shell screencap -d 4619827767814508545 -p /sdcard/cc.png`, then `pull`.
- Input: `shell input -d 2 tap X Y`, `shell input -d 2 swipe X1 Y1 X2 Y2 400`, and `shell input -d 2 keyevent 4` for BACK.
- Read only:
  - No confirm buttons, no level-ups, rerolls, equips or preset switches.
  - Leave the game on the Rift auto-repeat.
- Fast paths:
  - **Runes:** the cookie page → Sugar Runes, then the right arrow (1376,920) cycles through every cookie.
  - **Cookie info:** the right arrow at (1376,1230).
  - **Pet details:** the right arrow at (1376,1064).
  - **Gear:** tap a slot in the main screen's gear row for its tooltip, then tap it again to close.

## How to update

1. Pick the sections to re-read:
   - the ones the user says changed;
   - any whose `capturedAt` is older than the latest patch;
   - anything in `unread[]`.
2. Read only those screens, and save them under `snapshots/screens/<new date>/`.
3. Write `snapshots/<new date>.json`:
   - Copy unchanged sections forward with their original `capturedAt`.
   - Overwrite only the sections you re-read.
4. Diff the new snapshot against the old one. Redo the roadmap items whose inputs changed, and write a new dated roadmap.
