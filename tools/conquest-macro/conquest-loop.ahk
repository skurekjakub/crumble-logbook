#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\adb-lib\AdbScreen.ahk
; Guild Conquest retry loop over adb: lobby -> ENTER -> fight -> dismiss the results -> repeat.
; It reads the screen with `adb exec-out screencap` and taps with `adb shell input`, so the emulator
; window can sit behind other windows. Every knob is in conquest-loop.ini; see README.md.

global IniPath := A_ScriptDir "\conquest-loop.ini"
global Cfg := Map()
global Running := false
global Probing := false
global Runs := 0
global Phase := "idle"

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "emulator-5556",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("EnterX", "712", "EnterY", "2172", "DismissX", "720", "DismissY", "2470", "JitterPx", "6"),
    "Detect", Map("Lobby", "1200,1374,00CB8F|100,1494,005667|60,2300,007E91|1100,2290,007E91|1320,2160,00CB8F",
                  "EnterReady", "880,2144,FD9500",
                  "Result", "",
                  "ResultPoints", "200,300|720,300|1240,300|200,1280|720,1280|1240,1280|200,2300|720,2300|1240,2300",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "2000", "AfterEnterMs", "6000", "MinFightMs", "66000", "MaxFightMs", "100000",
                  "StallMs", "60000"),
    "Run", Map("MaxRuns", "0", "StuckLimit", "3", "LogFile", "conquest-loop.log")
)

LoadConfig()
UpdateStatus()
for arg in A_Args
    if (arg = "/start")
        ToggleRun()

F7:: ToggleProbe()
F8:: ToggleRun()
F9:: Learn()
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
    line := FormatTime(, "yyyy-MM-dd HH:mm:ss") " [run " Runs "] " msg "`n"
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
    ToolTip("Conquest loop: " state " | runs " Runs " | " Phase (extra ? " " extra : "")
        . "`nF8 start/stop  F7 probe  F9 learn  F10 reload ini  F12 exit", 10, 10, 1)
}

/**
 * Classifies a capture.
 * @param buf capture from Capture()
 * @returns "result" (only once its signature is learned), "lobby", or "other" (a fight, a
 *   transition, or a result screen it hasn't learned)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Result"])
        return "result"
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
 * The retry loop, run on its own thread by ToggleRun. Checks the screen every PollMs.
 * - In the lobby with ENTER lit, it taps ENTER.
 * - Off the lobby, it taps Dismiss once the learned result screen shows, or, with no result
 *   learned, once MinFightMs have passed since ENTER (the fight's full 60 s plus loading).
 *   MaxFightMs is the fallback either way.
 * Dismiss is the bottom-centre button, which leaves a running fight, so it is never tapped earlier.
 * @throws Error, caught here, when ENTER is greyed, ENTER keeps leaving the lobby showing, or the
 *   lobby doesn't come back within StallMs after MaxFightMs
 */
RunLoop() {
    global Runs, Phase, Running
    stuck := 0
    ; Started off the lobby: assume a fight began now, so Dismiss waits as it would after ENTER.
    enteredAt := A_TickCount
    try {
        while Running {
            buf := Capture()
            screen := ScreenOf(buf)
            if (screen = "lobby") {
                if (N("MaxRuns") > 0 && Runs >= N("MaxRuns")) {
                    Log("MaxRuns reached")
                    break
                }
                if !Shows(buf, Cfg["EnterReady"])
                    throw Error("ENTER isn't lit: the season is closed, or press F9 on the live lobby to learn its colour")
                if (stuck >= N("StuckLimit"))
                    throw Error("still in the lobby after " stuck " ENTER taps: a popup may be open")
                Phase := "enter"
                Tap("Enter")
                Runs += 1
                enteredAt := A_TickCount
                Log("entered")
                Wait(N("AfterEnterMs"))
                stuck := ScreenOf(Capture()) = "lobby" ? stuck + 1 : 0
                continue
            }
            since := A_TickCount - enteredAt
            if (screen = "result" || (Cfg["Result"] = "" && since >= N("MinFightMs")) || since >= N("MaxFightMs")) {
                if (since >= N("MaxFightMs") + N("StallMs"))
                    throw Error("the lobby didn't come back " Round(since / 1000) " s after ENTER")
                Phase := "results"
                Tap("Dismiss")
            } else {
                Phase := "fight " Round(since / 1000) "s"
            }
            Wait(N("PollMs"))
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        Log(SaveStopShot())
        TrayTip(e.Message, "Conquest loop stopped", 3)
    }
    Running := false
    Phase := "idle"
    UpdateStatus()
}

/**
 * Saves the screen the loop stopped on to stops\ next to the script.
 * @returns a log line naming the file, or saying none could be saved
 */
SaveStopShot() {
    dir := A_ScriptDir "\stops"
    try DirCreate(dir)
    name := FormatTime(, "yyyy-MM-dd_HHmmss") ".png"
    return SaveScreenshot(dir "\" name) ? "screen saved: stops\" name : "screen not saved"
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
 * F9: a menu that learns a screen's signature from what the game shows right now and saves it to
 * the INI: ENTER's lit colour (on the live lobby), the whole lobby, or the result screen.
 */
Learn() {
    m := Menu()
    m.Add("ENTER lit colour (on the live lobby)", LearnHandler.Bind("EnterReady", "EnterReady"))
    m.Add("Lobby (on the lobby)", LearnHandler.Bind("Lobby", "Lobby"))
    m.Add("Result screen (on the results, before dismissing)", LearnHandler.Bind("Result", "ResultPoints"))
    m.Add()
    m.Add("Forget the result screen", (*) => (IniWrite("", IniPath, "Detect", "Result"), LoadConfig(), UpdateStatus("result forgotten")))
    m.Show()
}

/**
 * Menu callback for Learn: samples the configured points on a fresh capture and saves them.
 * @param key [Detect] key to write, e.g. "Result"
 * @param pointsKey [Detect] key whose points to sample
 */
LearnHandler(key, pointsKey, *) {
    try {
        spec := Sample(Capture(), Cfg[pointsKey])
        IniWrite(spec, IniPath, "Detect", key)
        LoadConfig()
        Log("learned " key ": " spec)
        UpdateStatus("learned " key)
    } catch Error as e {
        TrayTip(e.Message, "Learn failed", 3)
    }
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
        text := "screen: " ScreenOf(buf) "`nLobby:" Describe(buf, Cfg["Lobby"])
            . "`nEnterReady:" Describe(buf, Cfg["EnterReady"]) "`nResult:" Describe(buf, Cfg["Result"])
    } catch Error as e {
        text := e.Message
    }
    ToolTip(text, 10, 60, 2)
}
