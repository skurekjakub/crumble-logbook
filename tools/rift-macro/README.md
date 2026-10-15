# Dimensional rift boss loop (AutoHotkey v2 + adb)

Fights each dimensional rift stage's boss with a movement script for that stage. It is the stage loop (`tools/stage-macro/README.md`) pointed at the rift: the same boss loop (`tools/macro-lib/BossLoop.ahk`), the same script format, log, hotkeys and recording. This file holds only what differs.

- `rift-loop.ahk`: the script. Run it as `AutoHotkey64.exe rift-loop.ahk /start` to start at once.
- `rift-loop.ini`: every knob. The script reads it at start and on F10.
- `stages/<stage>.txt`: the movement scripts, one per rift stage, e.g. `stages/12.txt`. The rift's bosses come round again every few stages, so a new stage usually starts from an earlier stage's walk against the same boss.
- `rift-loop.log`, `rift-runs.csv` (`time`, `stage`, then the stage loop's columns from `try`), `rift-loop.state` (the stage as `rift-<stage>`, e.g. `rift-12`), `recordings\`, `stops\`: as the stage loop's, and gitignored.

## What differs from the stage loop

- **The button** is the purple Summon Dimensional Boss, under the rift's energy bar ([Points] and [Detect] `Summon`).
- **The stage's number** is read from "Repeating Dimensional Rift Stage 12..." under the button, with `tools/hud`'s `rift` read. Its digits are the font of "Repeating Stage 358-20...", so the reader knows them all. An unread number saves `stops\unread_<stage>_<time>.png`; teach it with `node tools/hud/src/cli.ts learn <png> rift <stage>`.
- **A win can look like a loss.** The button can come back within seconds of a win, so a pass may be logged as a fail. The next read on the button corrects the stage (`read rift-13 on Summon Boss where rift-12 was expected`), and the loop plays the new stage's script from then.

## Before running

Turn the game's **Auto Summon** off (the checkbox beside the energy bar). With it on, the game summons the next boss after a win by itself and the script never plays. A restart of the emulator or the game turns it back on.
