# Stage boss loop (AutoHotkey v2 + adb)

Fights each stage's boss with a movement script for that stage. A stage's enemies are cleared hands-free; its boss encounter lasts 30 s, and the team only beats it if it gets onto the boss at once. So on **Summon Boss** the loop taps it and plays the stage's script from the scene change, holding W/A/S/D to walk the team onto the boss. A lost boss shows Summon Boss again on the same stage and the loop tries again; a beaten one moves the game to the next stage. Automating inputs may be against the game's terms of service; use at your own risk.

It talks to the emulator over adb, so the MuMu window can sit behind others:
- It reads the screen with `adb exec-out screencap` and the stage's number with `tools/hud` (Node 24+, `[Hud] Node`).
- It taps with `adb shell input tap` and walks with `adb shell input keyevent --duration` (one key) or `keycombination -t` (a diagonal). The game takes W/A/S/D from the emulator's keyboard.
- It records boss encounters with `adb shell screenrecord`, for writing and tuning a script: by default only a stage's tries with no script (`[Record] Video`).

The adb helpers and the loop's frame are shared with the other macros, in `tools/macro-lib/`.

- `stage-loop.ahk`: the script. Needs [AutoHotkey v2](https://www.autohotkey.com/).
- `stage-loop.ini`: every knob. The script reads it at start and on F10.
- `stages/`: the movement scripts, one per stage (below).
- `stage-loop.log`: the audit trail. Every screen change, every stage number read (or why it couldn't be), each tap, the scene change's delay, each script step with its time from the change, the encounter showing and ending, the boss's health each time it falls past another 10%, and each result with its reason and timings.
- `stage-runs.csv`: one row per boss encounter: `time`, `chapter`, `stage`, `world`, `try`, `script` (empty when the stage had none), `result` (`pass` or `fail`), `reason`, `boss_hp_pct` (the boss's lowest health read off its bar, 0 on a pass, empty when unread), `tap_to_change_s`, `change_to_encounter_s`, `encounter_s`, `video`.
- `stage-loop.state`: the stage being fought or next up, so a restart knows it without reading it.
- `recordings\`: the recorded encounters' videos, `<stage>_<try>_<time>.mp4`. `[Record] Video` picks the tries: `unscripted` (the default) records only tries of a stage with no script, `all` every try, `off` none. The loop reads it on every try, so F10 can switch to `all` while tuning a stubborn stage.
- `stops\`: the screen the loop stopped on after an error, and `unread_<stage>_<time>.png`, a Summon Boss screen whose number the reader couldn't read, for teaching it.

The log, the runs file, the state, the recordings and `stops\` stay local (gitignored).

## Before running

Turn the game's **Auto Summon** off (the checkbox beside the stage's bar). The game then holds each stage at Summon Boss once its bar is full, and the loop starts every encounter itself, so it knows when to play the script. With Auto Summon on, the game summons the boss on its own and the script never plays.

## Movement scripts

A stage's number is `<chapter>-<stage>`, e.g. `358-20`. The game's worlds repeat every `[Stages] Worlds` chapters (9), so a stage's script is `stages\w<chapter mod 9>\<stage>.txt`: 358-20 plays `stages\w7\20.txt`, and so will 367-20.

One step per line, played from the scene change after the tap on Summon Boss (the first capture of the solid dark transition screen, or of the encounter when a capture misses it); `;` starts a comment.

| Step | Does |
|---|---|
| `wait <ms>` | Nothing, for that long, while the loop follows the encounter on the screen. |
| `encounter` | Waits for the encounter's map: the first capture after the change that isn't the dark transition screen. |
| `W 800` | Holds W for 800 ms. `A`, `S` and `D` likewise. |
| `W+D 600` | Holds W and D together: a diagonal. |

The scene usually changes about 1 s after the tap, but has taken over 11 s, which is why scripts count from the change. The dark screen clears to the encounter's map a second or more before the boss's HUD shows, and the team can walk from then, so a walk from `encounter` starts as soon as the map is up and lands the same way every try. While a key is held the team walks in formation and stops attacking; once released, it fights whatever is in reach.

A script is read afresh on every try, so an edit takes effect on the next one. A step the loop can't parse is logged and ends the script for that try, and so does the encounter ending: a script can follow the boss with steps late in the fight without walking the team about once it's over.

A stage without a script fights with no input. If its boss wins, the loop waits on Summon Boss until the script exists (`WaitForScript`), checking for the file every `ClearingPollMs`; its recording shows where the boss stood.

## What the loop does

It classifies the screen (Summon Boss, a boss encounter by the red boss icon at its health bar, or anything else) and logs each change: every `PollMs` while a try is out, and every `ClearingPollMs` while nothing is deciding (the game clearing enemies after a win, or a stage waiting for its script). A poll's period counts from its capture's start, so a capture slower than `PollMs` makes polls back to back.
1. **Summon Boss:** when the screen comes to it, the loop takes the stage's number from "Repeating Stage 358-20…" once. When the reader can't read it, it goes by the stage it expected; with none expected, it reads again every `PollMs`. Then it starts the recording (when `[Record] Video` wants this try's), taps Summon Boss, waits for the scene to change and plays the script. If Summon Boss is still up `StartWaitMs` after the tap, it summons again.
2. **While a try is out**, it judges the result from the screens, with no stage number needed. Summon Boss back after the encounter is a loss: it returns about 5 s after DEFEAT. No Summon Boss for `PassAfterMs` after the encounter is a win, since the game goes back to clearing enemies on the next stage. After a win it expects the next stage, `358-21` after `358-20` and `359-1` after `358-30`.

It stops when no stage is expected yet and the number stays unreadable for `UnreadLimit` polls on Summon Boss, or when a stage loses `MaxTries` tries in a row (0 = never).

## Teaching the reader new digits

The stage's number is drawn in two fonts, one in the top bar and one under Summon Boss, and each learns its digits separately. A digit neither has seen yet leaves the number unreadable. The loop carries on with the stage it expected and saves the screen once per stage as `stops\unread_<stage>_<time>.png`. Teach the reader from that screenshot:

```powershell
node tools/hud/src/cli.ts learn tools/stage-macro/stops/unread_358-24_<time>.png stage 358-24
node tools/hud/src/cli.ts stage tools/stage-macro/stops/unread_358-24_<time>.png
```

## Hotkeys

| Key | Action |
|---|---|
| F8 | Start / stop |
| F7 | Probe: the screen it sees, the stage's number as read, and each signature pixel |
| F10 | Reload the INI |
| F12 | Exit |

Run it as `AutoHotkey64.exe stage-loop.ahk /start` to start at once.
