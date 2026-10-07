# EXP Dungeon retry loop (AutoHotkey v2 + adb)

Retries the EXP Dungeon stage until it falls. In the dungeon lobby it taps **ENTER**. On **DEFEAT** it taps the X ("Your ticket has been returned", so a loss costs no key) and then taps ENTER again. A win costs a key; with the game's own Auto (the green button) on, it rolls straight into the next stage, and the script keeps retrying wherever that chain ends. Automating inputs may be against the game's terms of service; use at your own risk.

It talks to the emulator over adb rather than the mouse, so the MuMu window can sit behind others or be resized:
- It reads the screen with `adb exec-out screencap` (raw RGBA) and checks a few pixels.
- It taps with `adb shell input`.

The adb helpers are shared with the Guild Conquest macro, in `tools/adb-lib/AdbScreen.ahk`.

## Run

1. Open the EXP Dungeon lobby on the stage to push.
2. Run `exp-retry.ahk` (double-click, or `AutoHotkey64.exe exp-retry.ahk /start` to start at once).
3. Press F8.

It never taps a screen it doesn't recognise, so fights and chains of wins are just watched.

| Key | Action |
|---|---|
| F8 | Start / stop |
| F7 | Probe: the screen it sees and the colour at each signature pixel |
| F10 | Reload `exp-retry.ini` |
| F12 | Exit |

## When it stops on its own

- **ENTER leaves the lobby showing several times in a row (`LobbyStuckLimit`):** usually out of keys, or a popup is open.
- **adb gives no screen image after its retries:** check `[Adb]`.
- **`MaxEntries` is reached.**

Every tap, defeat and stop is logged to `exp-retry.log` next to the script. Don't keep the log open with `tail -f` on Windows, which locks it: the script then drops log lines.

## Tuning

Everything is in `exp-retry.ini`. Points and pixels are in game pixels on the 1440×2560 portrait display that adb sees, not the window.
- **`[Adb]`:**
  - `CaptureDisplay` is the SurfaceFlinger display id (`adb shell dumpsys SurfaceFlinger --display-id`).
  - `InputDisplay` is the `input -d` index. MuMu runs the game on display 2.
- **`[Detect]`:** each screen is a list of `x,y,RRGGBB` pixels that must all be within `Tolerance`.
  - If a game update moves the lobby or the defeat screen, press F7 on that screen, read the colours, and update the list.
  - To read a pixel from a screenshot: `adb exec-out screencap -d <id> -p > s.png`.
