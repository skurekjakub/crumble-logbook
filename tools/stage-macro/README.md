# Stage boss loop (AutoHotkey v2 + adb)

Fights each stage's boss with a movement script for that stage. A stage's enemies are cleared hands-free; its boss encounter lasts 30 s, and the team only beats it if it gets onto the boss at once. So on **Summon Boss** the loop taps it and plays the stage's script from the tap, holding W/A/S/D to walk the team onto the boss. A lost boss shows Summon Boss again on the same stage and the loop tries again; a beaten one moves the game to the next stage. Automating inputs may be against the game's terms of service; use at your own risk.

It talks to the emulator over adb, so the MuMu window can sit behind others:
- It reads the screen with `adb exec-out screencap` and the stage's number with `tools/hud` (Node 24+, `[Hud] Node`).
- It taps with `adb shell input tap` and walks with `adb shell input keyevent --duration` (one key) or `keycombination -t` (a diagonal). The game takes W/A/S/D from the emulator's keyboard.
- It records each boss encounter with `adb shell screenrecord`, for tuning a script.

The adb helpers and the loop's frame are shared with the other macros, in `tools/macro-lib/`.

- `stage-loop.ahk`: the script. Needs [AutoHotkey v2](https://www.autohotkey.com/).
- `stage-loop.ini`: every knob. The script reads it at start and on F10.
- `stages/`: the movement scripts, one per stage (below).
- `stage-loop.log`: one line per tap, try, result and stop.
- `stage-runs.csv`: one row per boss encounter: `time`, `chapter`, `stage`, `world`, `try`, `script` (empty when the stage had none), `result` (`pass` or `fail`), `video`.
- `recordings\`: each encounter's video, `<stage>_<try>_<time>.mp4` (`[Record]`).
- `stops\`: the screen the loop stopped on after an error.

The log, the runs file, the recordings and `stops\` stay local (gitignored).

## Before running

Turn the game's **Auto Summon** off (the checkbox beside the stage's bar). The game then holds each stage at Summon Boss once its bar is full, and the loop starts every encounter itself, so a script's timing always counts from its own tap. With Auto Summon on, the game summons the boss on its own and the script never plays.

## Movement scripts

A stage's number is `<chapter>-<stage>`, e.g. `358-20`. The game's worlds repeat every `[Stages] Worlds` chapters (9), so a stage's script is `stages\w<chapter mod 9>\<stage>.txt`: 358-20 plays `stages\w7\20.txt`, and so will 367-20.

One step per line, played from the tap on Summon Boss; `;` starts a comment.

| Step | Does |
|---|---|
| `wait <ms>` | Nothing, for that long. |
| `W 800` | Holds W for 800 ms. `A`, `S` and `D` likewise. |
| `W+D 600` | Holds W and D together: a diagonal. |

The scene changes about 1.5 s after the tap and the encounter's timer starts about 4.5 s after it. Keys held before then still move the team once the scene loads, so a script can start walking early. While a key is held the team walks in formation and stops attacking; once released, it fights whatever is in reach.

A script is read afresh on every try, so an edit takes effect on the next one. A step the loop can't parse is logged and ends the script for that try.

A stage without a script fights with no input. If its boss wins, the loop waits on Summon Boss until the script exists (`WaitForScript`); its recording shows where the boss stood.

## What the loop does

Every `PollMs`:
1. **Summon Boss:** reads the stage's number from "Repeating Stage 358-20…". The same number as the try it was waiting on means that boss won. Then it starts the recording, taps Summon Boss and plays the script.
2. **A boss encounter** (the red boss icon by the health bar): waits.
3. **Anything else:** while a try is waiting on its result, a stage number other than the try's in the top bar means the boss fell.

It stops when the stage's number stays unreadable for `UnreadLimit` polls on Summon Boss, or when a stage loses `MaxTries` tries in a row (0 = never).

## Teaching the reader new digits

The stage's number is drawn in two fonts, one in the top bar and one under Summon Boss, and each learns its digits separately. A digit neither has seen yet leaves the number unreadable, and the loop stops with the screen in `stops\`. Teach it from that screenshot:

```powershell
node tools/hud/src/cli.ts learn tools/stage-macro/stops/<file>.png stage 358-24
node tools/hud/src/cli.ts stage tools/stage-macro/stops/<file>.png
```

## Hotkeys

| Key | Action |
|---|---|
| F8 | Start / stop |
| F7 | Probe: the screen it sees, the stage's number as read, and each signature pixel |
| F10 | Reload the INI |
| F12 | Exit |

Run it as `AutoHotkey64.exe stage-loop.ahk /start` to start at once.
