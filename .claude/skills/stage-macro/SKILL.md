---
name: stage-macro
description: Use when operating, monitoring or resuming the AutoHotkey stage boss loop (tools/stage-macro) or the dimensional rift's (tools/rift-macro) — "resume the macro", "push the rift", "start the loop from 362-1", "keep pushing stages", "watch the macro", "write the stage scripts", "the loop says waiting for a script", "it keeps losing 361-2", "restart everything", "I restarted the emulator" — or when a stage-loop log line, a recording or a stage script needs acting on. Not for changing the loop's code: that is feature-development, project-bugfixing or codebase-refactoring, and this skill gets updated after.
---

# Operating the stage boss loop

The loop (`tools/stage-macro/stage-loop.ahk`, documented in `tools/stage-macro/README.md`) fights
each stage's boss over adb against the MuMu emulator and plays a movement script per stage from
`tools/stage-macro/stages/w<chapter mod 9>/<stage>.txt`. Your job while it runs: start it, keep a
watch on its log, write each stage's script from its recording when the boss survives, and commit
the scripts in batches. The user drives the game's progression goal ("keep going until worlds
repeat"); you drive the loop.

Read the README first every session: it is the source of truth for knobs, the script format, the
log and the hotkeys. This skill holds only the operating procedure and the gotchas the README
doesn't.

**Keep this skill current.** Whenever the loop's behaviour, a knob, a log line the watcher greps
for, the launch command, or an operating lesson changes, update this file (and `watch.sh` /
`frames.sh` beside it) in the same commit as the change. The user asked for it to stay up to date.

## Paths

| What | Where |
|---|---|
| AutoHotkey v2 | `C:\Users\skure\AppData\Local\Programs\AutoHotkey\v2\AutoHotkey64.exe` |
| adb | `C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe`, serial `127.0.0.1:5557` |
| Loop's working dir | `tools/stage-macro/`, or `tools/rift-macro/` for the rift (log, runs CSV, state file, `recordings\`, `stops\`, all gitignored) |
| Watcher | `.claude/skills/stage-macro/watch.sh` (Monitor source) |
| Frame grid | `.claude/skills/stage-macro/frames.sh <video> <out.png> [seconds…]` |

## Start or resume

1. Session start rules from `AGENTS.md` first (fetch, pull).
2. Is it already running? `tasklist //FI "IMAGENAME eq AutoHotkey64.exe"`. Never start a second
   copy: both would tap and claim the hotkeys.
3. To resume from a given stage (the user beat one by hand, or names where to start), write it to
   `tools/stage-macro/stage-loop.state` (e.g. `362-1`, nothing else) with the Write tool while the
   loop is stopped. Otherwise leave the state file alone: the loop carries it.
   - **The dimensional rift has its own macro**, `tools/rift-macro/` (its README): the same
     boss loop and script format, its own ini, log (`rift-loop.log`), state (`rift-loop.state`,
     e.g. `rift-12`) and scripts (`tools/rift-macro/stages/<stage>.txt`). Launch it like the
     stage loop with `rift-loop.ahk` from `tools/rift-macro`, and pass its log to the watcher
     (`watch.sh <log>`). Never run both macros at once. It reads the rift stage off "Repeating
     Dimensional Rift Stage N..." under the button, so it follows the game on its own.
   - The user's rule for the rift: each new stage gets a walk at once, and the loop retries it
     until the team's power reaches the stage's line and it wins. Do this for every rift stage
     as the game advances, without asking. The rift's bosses come round every 6 stages (Rowdy
     Trucks on 4, 10 and 16; GingerCraven on 6 and 12), so a new stage copies the walk that beat
     its boss before: the trucks get the immediate down-left hold from the tap (`10.txt`), the
     user's call on 2026-10-15. Write a script for the next stage before the game gets there.
     Rift 4's walk copies a video clear whose times count from the boss's HUD; the user wants the
     keys down the moment the map loads, never waiting for the HUD.
   - **A rift stage is winnable only from its 15% power line.** Below it the team deals 5% of
     its damage and no walk or luck helps; the per-stage lines are on crumb's Dimensional Rift
     table (Stages page, season 2: rift 4 from 9.405G, rift 5 from 11.517G). On 2026-10-12 rift
     4 lost hundreds of tries at about 8.7G and fell within minutes of the power passing 9.4G.
     Compare the lobby power with the line before blaming a script.
   - **Auto Summon must be off in the rift too.** With it on, a win sends the game straight into
     the next rift stage's boss and no walk plays. The checkbox sat at 653,532 beside the button
     on 2026-10-15, and at 650,455 from season 3. Tap it **once**, then check a screenshot taken
     3 s later: one taken right after the tap still shows the old state, and a second tap "to
     make sure" turns it back on (2026-10-22).
   - **A new rift season resets the rift and can move its panel.** Season 3 (2026-10-22) restarted
     at rift 5 and moved the button, its "Repeating…" line and the Auto Summon box up 78 px, and
     narrowed the boss's health bar (fill from x 420 to 1132; the read showed 0% all fight). On a
     new season, screenshot the Summon screen and a fight, and check `[Points] Summon`,
     `[Detect] Summon` and `HpBar` in `rift-loop.ini` (and the defaults in `rift-loop.ahk`) and
     the band in `tools/hud/src/rift.ts` against them before launching. The walks for earlier
     stages carry over: season 3's bosses came round as in season 2 (Archangel on 5). The
     button's label wraps on one line or two ("Summon / Dimensional Boss"), so its signature
     samples only the purple body: lettering pixels made the loop miss the button and log a
     fight the user cut short at 79% as a pass.
   - **A rift win is often logged as a fail**: the button comes back within seconds of a win.
     On 2026-10-15 the game went from rift 12 to 16 while the stage loop logged only losses. The
     rift macro's read on the button corrects it (`read rift-N … where rift-M was expected`);
     when that line shows, make sure `stages/<N>.txt` exists.
4. Check the game: Summon Boss screen or clearing, and **Auto Summon off** (below).
5. Arm the watcher, then launch:
   - `Monitor` with `bash "C:/repositories/crumble-logbook/.claude/skills/stage-macro/watch.sh"`,
     `timeout_ms` 1800000. It expires every 30 min: re-arm on the expiry notice, then grep the log
     for `pass on|fail on|waiting for|error|stopped|unread|started|oven` since the last event so nothing
     was missed.
   - `powershell -NoProfile -Command "Start-Process -FilePath '<AutoHotkey64.exe>' -ArgumentList 'stage-loop.ahk','/start' -WorkingDirectory 'C:\repositories\crumble-logbook\tools\stage-macro'"`.
     (`cmd //c` fails under Git Bash.)
   - Confirm `started` and `expecting <stage>` in the log.

## Stop

`taskkill //PID <pid> //F` on the loop's AutoHotkey64.exe (find it with `tasklist`). Only when the
user asks, or to restart on new code. A recording in flight ends at its own time limit.

## React to each event

- **`pass on try N`**: if the stage has a script, update its comment (below), then delete the
  stage's recordings (Gotchas).
- **`fail on try 1 (no script)` + `waiting for stages\wX\N.txt`**: write the script now (below).
  The loop is idle until the file exists, and the game summons the boss by itself when Summon
  Boss sits untouched for about 2 minutes: that fight runs with no script, and a win shows up only
  as `read <next stage> on Summon Boss where <stage> was expected`.
- **`fail on try N (stages\…)`**: leave the script and let the loop retry, unless the recording
  shows the team missing the boss pack (below). Losses where the team sits on the boss are the
  team's damage falling short; retries absorb them. The user's rule: retry until it passes, don't
  over-engineer.
- **`stage number unread … screen saved: stops\unread_<stage>_<time>.png`**: teach the reader from
  that file: `node tools/hud/src/cli.ts learn <png> stage <stage>`, check with
  `node tools/hud/src/cli.ts stage <png>`, then `pnpm exec prettier --write tools/hud/templates.json`.
  The loop carries the expected stage meanwhile, so this never blocks it. Re-read a capture that
  read fine before after learning: on 2026-10-22 learning a rift 5 made an older, clean 5 read as
  3, so the learn was reverted (the miss was a one-off on a settling button).
- **`Summon Boss still up … summoning again`**: a tap didn't land; the loop retries by itself.
  A popup over the screen (an oven item's card, a menu) swallows the tap the same way.
- **`oven: …`** (`[Oven] TendOven=1`, on in the rift). With `OvenSell=1` the oven was full, and
  the loop sold the Auto Bake results and restarted it. The rift runs `OvenSell=0` since
  2026-10-23: the loop only logs `oven: Auto Bake stopped; leaving its results for the gear pass`
  and keeps fighting, and you run the gear pass (Rift gear below) and restart Auto Bake by hand.
  `oven: Auto Bake is running again` follows once it bakes. The user's rules: the oven is for its
  experience, sold only when full (a part-full oven has no Sell All and means selling item by
  item), never on a timer; items with the rift's substats go into DimensionRift first
  (2026-10-22). Auto Bake also stops when the lobby's preset dropdown opens ("Stopping Auto Bake
  to change Presets"), so a teal Auto button can mean a part-full oven: then restart it without
  selling. **`oven error: …`** means a window didn't show: the loop leaves the oven alone until it
  restarts. Look at `stops\oven_*.png`, close whatever is open (one Back closes an item's card),
  restart Auto Bake by hand (Auto, then Start) if it stopped, fix the signature, and restart the
  loop.
- **`error` / `stopped`**: read the log's tail and `stops\`; fix the cause, restart.

Don't narrate every try. The user's rule (2026-10-22): report passes, errors, oven runs and
stage-read corrections as they come, and losses only every 30 or so. Arm the watcher as
`watch-batched.sh <log> 30` (beside `watch.sh`), which passes those lines through and sums up
each 30 losses with the lowest health left; report each of its events in one short line.

## Rift lineup, levels and gear

The user's rules (2026-10-22): sugar runes are never edited; a deck's ATK order moves only by
deleveling, which is free and yours to do; the DimensionRift gear preset is built from oven drops.
Stop the loop before working in menus and relaunch it after.

- **ATK order.** Pomegranate's +69% Skill AMP beams go to Milk and Chardonnay first, then to the
  highest-ATK allies (record 001, "Pomegranate's beam"); Tiger Lily's 다발 3 makes the sixth beam.
  Rift 6 runs 그니's clear deck with Caine for Cheesecake, ordered Milk › Scorpion › Skating Queen
  › Brightseeker › Caine, every other cookie under Caine with about 5% to spare (Chardonnay and
  Pomegranate excepted). Read ATK on the cookie page's magnifier panel (exact to 1K). The levels,
  ATK and pets set on 2026-10-23 are in `docs/superpowers/plans/2026-10-22-rift-night.md`.
- **Deleveling.** Cookie page → the green Lv button beside the level → Reset Level (back to Lv.1,
  all its EXP returned). Long-press Level Up opens a target picker (−, the level, +, Max): tap
  Max, step down with −, then Level Up; or tap Level Up once per level. Fast tap bursts drop
  some taps, so read the picker before Level Up. Approach the target from below: a level can't
  go down again without another reset.
- **Header power.** The lobby header sums the lobby team's cookie power with its gear, so each
  delevel lowers it by that cookie's power change. The bracket line is judged on it: check it
  against the stage's 15% line after every change (rift 6: 13.8G).
- **Presets.** A lineup keeps its own gear preset (the dropdown in the lineup editor). The lobby's
  dropdown only switches which preset the lobby shows and equips into, stops Auto Bake, and
  snaps back to the lineup's preset when the cookie menu closes. DimensionRift (the renamed
  Evasion preset) fills from the oven while the rift lineup keeps Conquest; switch lineup 4 to
  it in the lineup editor once it beats Conquest on the rift's needs.
- **Rift gear** (research in the plan above): Skill AMP on weapons and upper accessories, damage
  reduction and HP on armour, damage reduction on lower accessories, accuracy and focus near
  1,200, **no skill haste** (Caine's ATK buff breaks after GingerCraven's fear with any haste).
  Auto Bake's filter keeps Accuracy, Skill AMP, DMG Reduction and Focus; everything else is sold
  as it bakes.
- **Gear pass** on `oven: Auto Bake stopped`: stop the loop; lobby dropdown → DimensionRift; open
  the oven's stack; for each item whose subs fit its slot and beat DimensionRift's piece (no
  haste line), tap it and Equip; then Sell All and confirm, Auto, Start; relaunch the loop.
  Record each equip in the plan.
- **Navigation.** One Back closes a card or menu. Back on the lobby opens the exit prompt ("Wait,
  hold on...") and a second one closes the game (2026-10-23). Relaunch with `adb shell am start
  -n com.devsisters.cc/com.devsisters.plugin.OvenUnityPlayerActivity`; it may come back on
  another display (3 instead of 2), which the loop resolves itself, and with Auto Summon on.

## Write a stage's script

1. Find the try's timings: `grep -E '\[<stage> #1\] (recording|tap|scene changed|encounter showing,)' tools/stage-macro/stage-loop.log`.
   The video starts at the `recording` line; the encounter HUD shows at tap + change + encounter.
2. Grid of frames around the HUD and after it:
   `bash .claude/skills/stage-macro/frames.sh tools/stage-macro/recordings/<file>.mp4 <scratchpad>/g.png 6 8.5 12 18`
   (shift the seconds so the first frame is just after the HUD shows), then Read the PNG. The
   boss's name is on the HUD bar; find it by its speech bubble and its red/spiky pack. The team
   stands at screen centre-left at the HUD.
3. Write `stages/w<chapter mod 9>/<stage>.txt`: one `encounter` line, then the walk. Format in the
   README. Comment header: boss, where it stands at the HUD, the no-input result, and "untested".
4. Reuse first: the same boss earlier in the chapter usually stands in the same place; copy the
   walk that beat it and say whose script it is.

The walk's rules (from the user, in the `stage-scripts-aim-at-cluster` memory):
- One straight walk from the HUD that ends with the **whole team on top of the boss's pack**, not
  touching its edge. The team walks in a long line; size the walk for the **back line**, not the
  lead cookie. Spread-out packs need longer walks, and a big single-bodied boss (the Cookievorous
  Plant of chapter 362) needs the walk to carry the team **well past its middle**: the user's
  words were "way deeper". Err long on these.
- Plain `D` when the boss is level; add `W`/`S` (as a diagonal `W+D` / `S+D`) only when it is
  clearly above or below. No padding legs, no mid-fight tracking.
- Change a script only when a recording shows the team missing the pack (short, or past it). A
  boss whose position varies from try to try gets the shorter walk.

## Keep comments honest

Each script's comment says what is known: the no-input result, each walk tried with its results
(health left), and the win with its date and fight length. Update it on the pass. If a try
started before an edit, it played the old walk: check `grep '\[<stage> #<try>\] step'` before
crediting a walk. A stage beaten by hand is recorded as such and its script stays "untested".

## Commit

Batch scripts (a chapter's worth, or before a restart): `pnpm verify`, commit
`tools/stage-macro/stages/` (+ `tools/hud/templates.json` if the reader learned), message per
`.ai/resources/pr-guidelines.md` written to a scratch file and `git commit -F`, then fetch and push.
Never commit `stage-runs*.csv`, the log, recordings or `stops\`.

## Gotchas

- **Emulator or game restart switches Auto Summon back on**, and may move the game to another
  display. With it on, the game summons after a win and the script never plays. Check the Summon
  Boss screen: the box beside "Auto Summon" must be empty. To untick it, find the game's display
  (`adb shell "dumpsys activity activities | grep -m1 'Display #'"` gives the input display; the
  SurfaceFlinger id for screencap is the matching `uniqueId` in `dumpsys display`) and
  `adb shell input -d <display> tap <x> <y>` on the checkbox (it sat at 655,305 on 2026-10-11;
  confirm on a screenshot first, then again after). The loop resolves displays itself on start.
- **Identical screenshots don't mean the game froze.** On 2026-10-12 screenshots of 364-24 came
  back the same seconds apart, and the loop was stopped for a "freeze" that the user says never
  happened. Ask the user before stopping the loop over a freeze.
- **A restart of the emulator can kill the loop silently**: after the user restarts it, check
  `tasklist` and relaunch.
- **`boss left at 0%` on a fail is a misread**: the bar drains on the defeat screen after time
  runs out. Trust the last `boss at N%` before `encounter gone` instead.
- **A "pass" can be the user playing the stage by hand.** If the user says so, record it.
- **A menu opened over a fight blinds the loop.** Missions, roulette or Auto Bake windows hide the
  boss HUD, so the fight looks "gone" and, with no Summon Boss for `PassAfterMs`, it is logged as a
  pass. A very short `lasting` on a pass is the tell; check the recording. The loop reads the
  stage on the next Summon Boss and corrects itself (`read X on Summon Boss where Y was
  expected`), so nothing needs fixing by hand, but don't credit a script with that win.
- **A game restart mid-fight is logged as a pass too**, and in a set (`rift-<n>`) nothing corrects
  it, since the loop never reads a set's stage. On every set pass, check the last `boss at N%`: a
  high one (rift 5's try 78 on 2026-10-12 showed 89%, then the title screen) means stop the loop,
  write the old stage back to the state file, untick Auto Summon (the restart ticks it) and
  relaunch.
- **`[Record] Video`** is `unscripted` by default: only no-script tries are recorded, which is all
  writing scripts needs. To diagnose a scripted stage, set `all` in `stage-loop.ini` and press F10
  in the loop (it rereads the ini); set it back after.
- **Recordings fill the disk** (~20–35 MB each). Clean them up as you go, which the user asked
  for: once a stage passes, delete its recordings (`recordings\<stage>_*.mp4`). Keep the stage in
  progress's until it passes, and wait for the next stage's first try to confirm the pass (a
  recording or a read showing the next stage): a false pass deleted 362-22's only recording.
- **Never `tail -f` the log**: it locks the file on Windows and the loop drops lines. Use the
  watcher or one-off `grep`/`tail -n`.
- **`/Validate` from Git Bash** needs `MSYS_NO_PATHCONV=1`, or AutoHotkey gets a mangled path and
  leaves an "ErrorStdOut" dialog the user has to close.
- **The loop going quiet after a "pass" whose boss was still high** means it doesn't see Summon
  Boss. Take a screenshot: "Repeating Stage <stage>…" under the button is the game repeating a
  stage whose boss won, and that screen once drew the button's lettering where `[Detect] Summon`
  didn't expect it. Sample the button's pixels (`ffmpeg -i shot.png -vf crop=1:1:x:y -f rawvideo
  -pix_fmt rgb24 - | xxd -p`) and fix the signature in the ini and the script's DEFAULTS.
- **A script's `encounter` step ends when the map shows** (`map showing at +N s`), not when the
  boss's HUD does, so the walk starts seconds earlier than it did for scripts written before
  2026-10-11. The user wants the hold to start the moment the map loads. A full-screen capture
  takes 1.5–2 s, which is most of the lag that remains, and it grows as the emulator runs (2–3 s
  after a night). A script that starts with `tap` instead of `encounter` holds its keys right
  after the tap on Summon Boss, with no capture first; the user asked for it on rift 6.
- **Changing the loop's code while it runs**: work in a worktree lane, merge, then stop and
  relaunch the loop between fights (state is carried). Faster captures shift script timing
  slightly; watch whether stages that used to win start missing.
