---
name: stage-macro
description: Use when operating, monitoring or resuming the AutoHotkey stage boss loop (tools/stage-macro) — "resume the macro", "start the loop from 362-1", "keep pushing stages", "watch the macro", "write the stage scripts", "the loop says waiting for a script", "it keeps losing 361-2", "restart everything", "I restarted the emulator" — or when a stage-loop log line, a recording or a stage script needs acting on. Not for changing the loop's code: that is feature-development, project-bugfixing or codebase-refactoring, and this skill gets updated after.
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
| Loop's working dir | `tools/stage-macro/` (log, runs CSV, state file, `recordings\`, `stops\`, all gitignored) |
| Watcher | `.claude/skills/stage-macro/watch.sh` (Monitor source) |
| Frame grid | `.claude/skills/stage-macro/frames.sh <video> <out.png> [seconds…]` |

## Start or resume

1. Session start rules from `AGENTS.md` first (fetch, pull).
2. Is it already running? `tasklist //FI "IMAGENAME eq AutoHotkey64.exe"`. Never start a second
   copy: both would tap and claim the hotkeys.
3. To resume from a given stage (the user beat one by hand, or names where to start), write it to
   `tools/stage-macro/stage-loop.state` (e.g. `362-1`, nothing else) with the Write tool while the
   loop is stopped. Otherwise leave the state file alone: the loop carries it.
   - The dimensional rift is its own set: write `rift-<stage>` (e.g. `rift-4`), and its scripts
     live in `stages/rift/`. The user's rule for the rift: no movement, it's luck, just keep
     summoning, so its scripts have no steps. Write the next chapter stage back when the user
     returns to the chapters. The rift has its own purple Summon Dimensional Boss button, read
     and tapped as `RiftSummon` in `[Detect]` and `[Points]` (sampled 2026-10-12); the boss HUD
     is the stages' one. Rift 4's walk copies a video clear whose times count from the boss's
     HUD; it still starts at the map (`encounter`) and holds longer, because the user wants the
     keys down the moment the map loads, never waiting for the HUD. The loss there is power (the
     15% damage cut), not the walk.
   - **A rift stage is winnable only from its 15% power line.** Below it the team deals 5% of
     its damage and no walk or luck helps; the per-stage lines are on crumb's Dimensional Rift
     table (Stages page, season 2: rift 4 from 9.405G, rift 5 from 11.517G). On 2026-10-12 rift
     4 lost hundreds of tries at about 8.7G and fell within minutes of the power passing 9.4G.
     Compare the lobby power with the line before blaming a script.
   - **Auto Summon must be off in the rift too.** With it on, a win sends the game straight into
     the next rift stage's boss, so the loop never sees the pause that marks a pass, logs a fail,
     and plays the old stage's script against the new boss: rift 4's win on 2026-10-12 went
     unnoticed for about a dozen tries. Since the loop never reads a rift stage's number, check
     a screenshot when the results jump. The checkbox sat at 800,376 during a rift fight.
4. Check the game: Summon Boss screen or clearing, and **Auto Summon off** (below).
5. Arm the watcher, then launch:
   - `Monitor` with `bash "C:/repositories/crumble-logbook/.claude/skills/stage-macro/watch.sh"`,
     `timeout_ms` 1800000. It expires every 30 min: re-arm on the expiry notice, then grep the log
     for `pass on|fail on|waiting for|error|stopped|unread|started` since the last event so nothing
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
  The loop carries the expected stage meanwhile, so this never blocks it.
- **`Summon Boss still up … summoning again`**: a tap didn't land; the loop retries by itself.
- **`error` / `stopped`**: read the log's tail and `stops\`; fix the cause, restart.

Report each event to the user in one short line.

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
  takes 1.5–2 s, which is most of the lag that remains.
- **Changing the loop's code while it runs**: work in a worktree lane, merge, then stop and
  relaunch the loop between fights (state is carried). Faster captures shift script timing
  slightly; watch whether stages that used to win start missing.
