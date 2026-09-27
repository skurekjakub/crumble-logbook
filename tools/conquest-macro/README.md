# Guild Conquest retry loop (AutoHotkey v2)

Repeats the Guild Conquest (길드 토벌전) Piñata fight forever: lobby → **Enter** → wait the whole fight → dismiss the result screens → back to the lobby → again. Players push records by retrying, so this runs the retries unattended. Automating inputs may be against the game's terms of service; use at your own risk.

- `conquest-loop.ahk`: the script. Needs [AutoHotkey v2](https://www.autohotkey.com/) (`winget install AutoHotkey.AutoHotkey`).
- `conquest-loop.ini`: every knob (window, tap points, colours, delays). The script reads it at start and on F10. Missing keys fall back to the defaults in the script.
- `conquest-loop.log`: written next to the script, one line per tap/run/error.

## What the loop does

1. **Wait for the lobby.** With `UseLobbyColor=1`, it waits until the pixel at `LobbyPixel` matches `LobbyColor` (the orange Enter button), tapping `Dismiss` meanwhile. `StuckLimit` stalls in a row stop the loop.
2. **Tap `Enter`.** If `ConfirmEnabled=1`, it then taps `Confirm` after `ConfirmDelayMs`.
3. **Wait `PostEnterDelayMs`** for loading and the START banner.
4. **Wait `FightSeconds` (60) in full.** This happens even if the team wipes at 17 s, so any survivors keep scoring until 0 s.
5. **Wait `EndBufferMs`,** then tap `Dismiss` up to `DismissTaps` times. It stops early once the lobby is back, so it never taps Enter by accident.
6. Repeat until F8, or until `MaxRuns` runs.

The fight facts behind these defaults come from `research/001-guild-conquest-meta`: the fight is 60 s, and the team wipes when the timer shows about 17 s. In the videos, BATTLE OVER shows right after the wipe (yt-yeICL4cCLZU at 285–331 s; yt-ZjPH1YEbDnA at about 94–100 s).

## Hotkeys

| Key | Action |
|---|---|
| F8 | Start / stop the loop (stops at the next 0.2 s slice) |
| F7 | Probe: tooltip with the cursor's position relative to the game area, and the pixel colour |
| F9 | Calibrate: a menu to save the cursor position as Enter / Confirm / Dismiss, or as LobbyPixel along with its colour |
| F10 | Reload the INI |
| F12 | Exit |

## Tuning on the target PC

Every position is a fraction of the **game area**: `0,0` is the top-left and `1,1` the bottom-right. So one calibration survives resizing the window.

1. **`[Window] Title`:** set it to part of the game window's title, or to `ahk_exe <emulator>.exe`. The bundled `WindowSpy.ahk` (in the AutoHotkey install folder) shows both.
2. **`GameAspect`:** if the emulator draws the portrait game inside a wider window with bars at the sides, set this to the game's width/height, for example `0.5625` for 9:16 or `0.4615` for 9:19.5. Otherwise the whole client area is the game. Check with F7: the probe should read `0.0000,0.0000` at the game picture's top-left corner and `1.0000,1.0000` at its bottom-right.
3. **Lobby:** hover over the middle of **Enter**, press F9, choose *Set Enter here*. Then hover over a flat orange part of Enter, press F9, choose *Set LobbyPixel + colour here*.
4. **Results:** play one fight by hand. On the BATTLE OVER / result screen, hover over the button or area that returns to the lobby, press F9, choose *Set Dismiss here*. Check that this spot is **not** on the Enter button when you're in the lobby, and not on anything that opens another screen. If more screens follow (a reward popup, for example), pick a spot that closes each of them, or raise `DismissTaps`.
5. **Confirm popup:** if Enter opens a confirmation, set `ConfirmEnabled=1` and calibrate `Confirm`.
6. **Delays:**
   - Time Enter to the fight clock starting and put that in `PostEnterDelayMs`.
   - Time the fight's end to when the result screen accepts taps and put that in `EndBufferMs`.
   - Leave `FightSeconds=60`.
7. **Clicks don't register:** try `SendMode=Event`. For background clicking, try `ClickMethod=ControlClick`; many emulators ignore it, and then the window must stay in the foreground.
8. **Test:** set `MaxRuns=2`, press F8, watch both runs, then check `conquest-loop.log`. Set `MaxRuns=0` for unlimited.

## Checking the script without running it

From PowerShell:

```powershell
& "$env:LOCALAPPDATA\Programs\AutoHotkey\v2\AutoHotkey64.exe" /ErrorStdOut /validate conquest-loop.ahk; $LASTEXITCODE
```

Exit code 0 means the script loads; syntax errors are printed. Don't run this from Git Bash: MSYS rewrites `/ErrorStdOut` into a path, and AutoHotkey then pops a "Script file not found" dialog. If you must use Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`.
