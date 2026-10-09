# Guild Conquest retry loop (AutoHotkey v2 + adb)

Repeats the Guild Conquest (길드 토벌전) Piñata fight forever: lobby → **ENTER** → fight → dismiss the results → lobby → again. Players push records by retrying, so this runs the retries unattended. Automating inputs may be against the game's terms of service; use at your own risk.

It talks to the emulator over adb rather than the mouse, so the MuMu window can sit behind others or be resized:
- It reads the screen with `adb exec-out screencap` (raw RGBA) every `PollMs` (2 s).
- It taps with `adb shell input`.

The adb helpers are shared with the EXP Dungeon macro, in `tools/adb-lib/AdbScreen.ahk`.

- `conquest-loop.ahk`: the script. Needs [AutoHotkey v2](https://www.autohotkey.com/) (`winget install AutoHotkey.AutoHotkey`).
- `conquest-loop.ini`: every knob. The script reads it at start and on F10. F9 writes learned signatures to it.
- `conquest-loop.log`: one line per tap, run, learn or stop.
- `stops\`: when the loop stops on an error, the screen it stopped on, as a PNG named by the time, logged next to the error.

## What the loop does

Every 2 s it captures the screen and:
1. **Lobby with ENTER lit:** taps ENTER. If the lobby still shows after `StuckLimit` taps, it stops.
2. **Lobby with ENTER greyed:** stops. The season is closed.
3. **Anything else:** a fight or the results.
   - It taps Dismiss (the bottom-centre button) once the results show. Until the result screen is learned, that means once `MinFightMs` (66 s: loading plus the 60 s fight) has passed since ENTER.
   - Dismiss is never tapped earlier, because in a running fight that button leaves the fight.
   - After `MaxFightMs` it taps Dismiss whatever the screen shows.
   - If the lobby isn't back within `StallMs` after that, it stops.

The fight facts behind these defaults come from `research/001-guild-conquest-meta`: the fight is 60 s, and the team wipes when the timer shows about 17 s. ENTER and Dismiss sit where the earlier mouse-driven version tapped them through Season 6.

## First run of a season

The lobby layout was read from the game on 2026-10-07, between seasons, so ENTER's lit colour is assumed: the orange of every other ENTER. On the first live lobby:
1. Press **F9 → ENTER lit colour** on the lobby.
2. Press **F8**.
3. When the first results show, press **F9 → Result screen** before the loop dismisses them. From then on it dismisses as soon as the results appear, including after an early wipe, instead of waiting the full time.

**F7** shows what the script sees: the screen it classifies, and the colour at each signature pixel next to the colour it wants.

## Hotkeys

| Key | Action |
|---|---|
| F8 | Start / stop |
| F7 | Probe |
| F9 | Learn a signature from the current screen: ENTER lit, the lobby, or the results (or forget the results) |
| F10 | Reload the INI |
| F12 | Exit |

## Tuning

Points and pixels are in game pixels on the 1440×2560 portrait display that adb sees, not the window.
- **`[Adb]`:** `CaptureDisplay` (the SurfaceFlinger id for `screencap -d`) and `InputDisplay` (the `input -d` index) default to `auto`: the display whose top activity is `Package`. MuMu renumbers its displays when it restarts, so a fixed id goes stale; `auto` finds the game again whenever a capture fails. To pin one, read `adb shell dumpsys activity activities` (the `Display #N` running the game) and `adb shell dumpsys display` (that display's `uniqueId='local:…'`).
- **`[Detect]`:** each screen is a list of `x,y,RRGGBB` pixels that must all be within `Tolerance`. If an update moves the lobby, re-learn it with F9.

Don't keep the log open with `tail -f` on Windows, which locks it: the script then drops log lines.

## Checking the script without running it

From PowerShell:

```powershell
& "$env:LOCALAPPDATA\Programs\AutoHotkey\v2\AutoHotkey64.exe" /ErrorStdOut /validate conquest-loop.ahk; $LASTEXITCODE
```

Exit code 0 means the script loads; syntax errors are printed. Don't run this from Git Bash: MSYS rewrites `/ErrorStdOut` into a path, and AutoHotkey then pops a "Script file not found" dialog. If you must use Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`.
