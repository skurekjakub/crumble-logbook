#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\adb-lib\AdbScreen.ahk
; EXP Dungeon retry loop over adb: taps ENTER in the dungeon lobby, closes the DEFEAT screen, repeats.
; It reads the screen with `adb exec-out screencap` and taps with `adb shell input`, so the emulator
; window can sit behind other windows. Every knob is in exp-retry.ini; see README.md.

global IniPath := A_ScriptDir "\exp-retry.ini"
global Cfg := Map()
global Running := false
global Probing := false
global Entries := 0
global Defeats := 0
global Phase := "idle"

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "emulator-5556",
               "CaptureDisplay", "4619827767814508545", "InputDisplay", "2"),
    "Points", Map("EnterX", "716", "EnterY", "2070", "CloseX", "720", "CloseY", "2470", "JitterPx", "6"),
    "Detect", Map("Lobby", "880,2040,FD9500|600,2120,EB8A00|1080,2080,025F72|100,2290,D9E4E7",
                  "Defeat", "120,300,0A364B|880,2040,0D384C|100,2290,093346|720,2450,FFD21C",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "1500", "AfterEnterMs", "6000", "AfterCloseMs", "2500"),
    "Run", Map("MaxEntries", "0", "LobbyStuckLimit", "3", "LogFile", "exp-retry.log")
)

LoadConfig()
UpdateStatus()
for arg in A_Args
    if (arg = "/start")
        ToggleRun()

F7:: ToggleProbe()
F8:: ToggleRun()
F10:: {
    LoadConfig()
    UpdateStatus("config reloaded")
}
F12:: ExitApp()

/**
 * Raised inside the run thread when F8 stops the loop; unwinds any wait.
 */
class StopSignal extends Error {
}

/**
 * Reads every knob from the INI into Cfg, falling back to DEFAULTS.
 */
LoadConfig() {
    global Cfg
    Cfg := Map()
    for section, keys in DEFAULTS
        for key, fallback in keys
            Cfg[key] := Trim(IniRead(IniPath, section, key, fallback))
}

/**
 * Returns the numeric value of a knob.
 * @param key knob name, e.g. "PollMs"
 * @returns Number; throws if the INI value isn't numeric
 */
N(key) {
    return Number(Cfg[key])
}

/**
 * Appends a timestamped line to the log file next to the script. A write that fails (another
 * program holding the file open, say) is retried briefly and then dropped, never raised.
 * @param msg text to log
 */
Log(msg) {
    line := FormatTime(, "yyyy-MM-dd HH:mm:ss") " [entries " Entries ", defeats " Defeats "] " msg "`n"
    loop 5 {
        try {
            FileAppend(line, A_ScriptDir "\" Cfg["LogFile"], "UTF-8")
            return
        }
        Sleep 100
    }
}

/**
 * Shows the status tooltip in the top-left corner of the screen.
 * @param extra optional detail appended after the phase
 */
UpdateStatus(extra := "") {
    state := Running ? "RUNNING" : "stopped"
    ToolTip("EXP retry: " state " | entries " Entries " | defeats " Defeats " | " Phase (extra ? " " extra : "")
        . "`nF8 start/stop  F7 probe  F10 reload ini  F12 exit", 10, 10, 1)
}

/**
 * Classifies a capture.
 * @param buf capture from Capture()
 * @returns "defeat", "lobby", or "other" (a fight, a transition or anything unknown)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Defeat"])
        return "defeat"
    if Shows(buf, Cfg["Lobby"])
        return "lobby"
    return "other"
}

/**
 * Taps a named point in game pixels, with a random offset of up to JitterPx.
 * @param name point prefix in [Points], e.g. "Enter" reads EnterX / EnterY
 */
Tap(name) {
    p := TapAt(N(name "X"), N(name "Y"), N("JitterPx"))
    Log("tap " name " @ " p.x "," p.y)
}

/**
 * Sleeps in short slices, unwinding when the loop is stopped.
 * @param ms duration in milliseconds
 * @throws StopSignal when F8 stops the loop mid-wait
 */
Wait(ms) {
    finish := A_TickCount + ms
    while (A_TickCount < finish) {
        if !Running
            throw StopSignal()
        UpdateStatus()
        Sleep 200
    }
}

/**
 * The retry loop, run on its own thread by ToggleRun. It never taps on a screen it doesn't
 * recognise, so a fight (or a chain of wins under the game's Auto) just gets polled.
 * @throws Error, caught here, when ENTER keeps leaving the lobby showing (out of keys or a popup)
 */
RunLoop() {
    global Entries, Defeats, Phase, Running
    stuck := 0
    last := ""
    try {
        while Running {
            screen := ScreenOf(Capture())
            if (screen = "defeat") {
                ; The X only answers once DEFEAT's animation ends, so one defeat can take several taps.
                if (last != "defeat") {
                    Defeats += 1
                    Log("defeat")
                }
                last := screen
                Phase := "defeat, closing"
                Tap("Close")
                Wait(N("AfterCloseMs"))
                continue
            }
            last := screen
            if (screen = "lobby") {
                if (N("MaxEntries") > 0 && Entries >= N("MaxEntries")) {
                    Log("MaxEntries reached")
                    break
                }
                if (stuck >= N("LobbyStuckLimit"))
                    throw Error("still in the lobby after " stuck " ENTER taps: out of keys, or a popup is open")
                Phase := "enter"
                Tap("Enter")
                Entries += 1
                Wait(N("AfterEnterMs"))
                stuck := ScreenOf(Capture()) = "lobby" ? stuck + 1 : 0
                continue
            }
            Phase := "fight"
            Wait(N("PollMs"))
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        TrayTip(e.Message, "EXP retry stopped", 3)
    }
    Running := false
    Phase := "idle"
    UpdateStatus()
}

/**
 * F8: starts the loop on a new thread, or asks a running loop to stop at its next wait slice.
 */
ToggleRun() {
    global Running
    if Running {
        Running := false
        UpdateStatus("stopping")
        return
    }
    LoadConfig()
    Running := true
    Log("started")
    SetTimer(RunLoop, -1)
}

/**
 * F7: toggles a probe that captures the screen and shows what the script sees: the screen it
 * classifies and the colour at every signature pixel.
 */
ToggleProbe() {
    global Probing
    Probing := !Probing
    SetTimer(ShowProbe, Probing ? 2000 : 0)
    if Probing
        ShowProbe()
    else
        ToolTip(, , , 2)
}

/**
 * Draws the probe tooltip under the status line.
 */
ShowProbe() {
    try {
        buf := Capture()
        text := "screen: " ScreenOf(buf) "`nLobby:" Describe(buf, Cfg["Lobby"]) "`nDefeat:" Describe(buf, Cfg["Defeat"])
    } catch Error as e {
        text := e.Message
    }
    ToolTip(text, 10, 60, 2)
}
