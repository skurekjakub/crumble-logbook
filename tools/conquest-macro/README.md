# Guild Conquest retry loop (AutoHotkey v2 + adb)

Repeats the Guild Conquest (길드 토벌전) Piñata fight forever: lobby → **ENTER** → fight → dismiss the results → lobby → again. Players push records by retrying, so this runs the retries unattended. Automating inputs may be against the game's terms of service; use at your own risk.

It talks to the emulator over adb rather than the mouse, so the MuMu window can sit behind others or be resized:
- It reads the screen with `adb exec-out screencap` (raw RGBA) every `PollMs` (2 s).
- It taps with `adb shell input`.

The adb helpers are shared with the EXP Dungeon macro, in `tools/adb-lib/AdbScreen.ahk`.

- `conquest-loop.ahk`: the script. Needs [AutoHotkey v2](https://www.autohotkey.com/) (`winget install AutoHotkey.AutoHotkey`).
- `conquest-loop.ini`: every knob. The script reads it at start and on F10. F9 writes learned signatures to it.
- `conquest-loop.log`: one line per tap, run, learn or stop.
- `conquest-runs.csv`: one row per run, for charting (see [Runs file](#runs-file)).
- `stops\`: when the loop stops on an error, the screen it stopped on, as a PNG named by the time, logged next to the error.

## What the loop does

Every 2 s it captures the screen and:
1. **Lobby with ENTER lit:** taps ENTER. If the lobby still shows after `StuckLimit` taps (a popup swallowing them), it leaves the lobby with Back and recovers.
2. **Lobby with ENTER greyed:** waits. The lobby greys ENTER for a moment on its way back from the results, so the loop stops (the season is closed) only after `GreyLimit` polls in a row.
3. **Anything else:** a fight or the results.
   - **Following the fight:** from `ReadFromMs` after ENTER it reads the fight's score and countdown as fast as captures come (about two a second), and keeps every reading as the run's score curve. The fight is over when the countdown reads 0, or when neither number has been read for `GoneMs`.
   - **Pace check:** if the score is below `MinScore` when the countdown shows `CheckAtS` seconds left, it ends the run: the bottom-centre button, then **End Battle** on "Are you sure you want to end the battle?".
   - The score at exactly `CheckAtS` is interpolated between the reads either side of it. Around 30 s left the score climbs about 0.16T a second, so a late read would flatter it.
   - It taps Dismiss (the bottom-centre button) once the results show: `AfterEndMs` after End Battle, once it has seen the fight end, or once the result screen is learned or `MinFightMs` (66 s: loading plus the 60 s fight) has passed since ENTER. It never taps it earlier, because in a running fight that button asks to end the battle.
   - Before that first Dismiss it reads the final score off BATTLE OVER, for up to `FinalWaitMs`, and records the run.
   - With no lobby `MaxFightMs` after ENTER, it recovers.

The pace check reads the HUD with `tools/conquest-hud`, which Node 24+ runs directly (`[Prune] Node`). It cuts each digit out by colour and matches it against `tools/conquest-hud/templates.json`. A digit hidden behind a floating damage number makes the read fail, never misread. With no score read by `CheckAtS - LateS`, the run is kept.

**Recovering** brings the game back to the Conquest lobby from anywhere: the main screen, the guild hall, a popup, or a closed game. On the lobby the bottom-centre button is Back, and in the guild hall it is Close, so a missed lobby can walk Dismiss out to the main screen. Each try:
1. Relaunches the game (`Activity`) and waits `LaunchWaitMs` if it isn't on top.
2. Dismisses a learned result screen.
3. Taps the bottom bar's **Guild** button, then the guild hall's **Guild Conquest** building, checking for the lobby after each.
4. Presses Back, to close a popup that hides the bottom bar.

It saves the screen to `stops\` when it starts recovering, and stops after `RecoverTries` tries.

## Runs file

`conquest-runs.csv` (`[Run] RunsFile`) gets a row per run, and the log a matching `run over:` line. `conquest-curves.csv` (`CurvesFile`) gets the run's score curve: a row per reading (`time`, the run's ENTER time; `t_left`, the seconds left; `score`). Both stay local, like the log, and the app's Guild Conquest **Attempts** tab charts them while the server runs locally.

| Column | Value |
|---|---|
| `time` | When ENTER was tapped. |
| `run` | The run number in the log. |
| `end` | How the run ended (below). |
| `pace_score` | The score at `CheckAtS` seconds left; empty when none was read. |
| `final_score` | The BATTLE OVER final score; empty when it couldn't be read, in which case the screen is saved to `stops\`. |

| `end` | Meaning |
|---|---|
| `pruned` | Behind `MinScore` at `CheckAtS`; ended with End Battle. |
| `kept-on-pace` | Met `MinScore`; played the full fight. |
| `kept-unjudged` | No score read at `CheckAtS` (the check off, a fight already running when the loop started, or the HUD unreadable); played the full fight. |
| `kept-end-failed` | Behind pace, but the end-battle question never showed; played the full fight. |
| `stopped`, `error` | F8 or an error stopped the loop mid-run; no final score. |
| `no-results` | The lobby came back without the results showing; no final score. |

The fight facts behind these defaults come from `research/001-guild-conquest-meta`: the fight is 60 s, and the team wipes when the timer shows about 17 s. ENTER and Dismiss sit where the earlier mouse-driven version tapped them through Season 6.

## First run of a season

The lobby layout was read from the game on 2026-10-07, between seasons, so ENTER's lit colour is assumed: the orange of every other ENTER. On the first live lobby:
1. Press **F9 → ENTER lit colour** on the lobby.
2. Press **F8**.
3. When the first results show, press **F9 → Result screen** before the loop dismisses them. From then on it dismisses as soon as the results appear, including after an early wipe, instead of waiting the full time.

**F7** shows what the script sees: the screen it classifies, the scores and countdown it reads, and the colour at each signature pixel next to the colour it wants.

If an update changes a font and the pace check or the final score logs unreadable digits, teach it the new digits from a screenshot (`adb exec-out screencap -p -d <id> > shot.png`) whose numbers you can read: a fight for `score` and `timer`, BATTLE OVER for `final`.

```powershell
node tools/conquest-hud/src/cli.ts learn shot.png score 1,776,472,632,591
node tools/conquest-hud/src/cli.ts learn shot.png timer 30.267
node tools/conquest-hud/src/cli.ts learn results.png final 2,831,485,998,371
```

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
- **`[Adb]` `Serial`:** the emulator's adb address, `127.0.0.1:5557` for this MuMu instance (`adb devices` lists it once connected). The adb server drops an emulator that restarts and never scans for it again, so a `host:port` serial that stops answering is disconnected and connected again before the loop gives up. An `emulator-N` serial gets no such retry: after MuMu restarts it stays missing until `adb kill-server`.
- **`[Adb]`:** `CaptureDisplay` (the SurfaceFlinger id for `screencap -d`) and `InputDisplay` (the `input -d` index) default to `auto`: the display whose top activity is `Package`. MuMu renumbers its displays when it restarts, so a fixed id goes stale; `auto` finds the game again whenever a capture fails. To pin one, read `adb shell dumpsys activity activities` (the `Display #N` running the game) and `adb shell dumpsys display` (that display's `uniqueId='local:…'`).
- **`[Detect]`:** each screen is a list of `x,y,RRGGBB` pixels that must all be within `Tolerance`. If an update moves the lobby, re-learn it with F9.
- **`[Prune]`:** `MinScore` is the score a run must have at `CheckAtS` seconds left: `1950000000000` is 2T less 2.5% leniency, and `0` turns the pace check off.

Don't keep the log open with `tail -f` on Windows, which locks it: the script then drops log lines.

## Checking the script without running it

From PowerShell:

```powershell
& "$env:LOCALAPPDATA\Programs\AutoHotkey\v2\AutoHotkey64.exe" /ErrorStdOut /validate conquest-loop.ahk; $LASTEXITCODE
```

Exit code 0 means the script loads; syntax errors are printed. Don't run this from Git Bash: MSYS rewrites `/ErrorStdOut` into a path, and AutoHotkey then pops a "Script file not found" dialog. If you must use Git Bash, prefix the command with `MSYS_NO_PATHCONV=1`.
