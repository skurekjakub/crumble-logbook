; The frame every macro under tools/ runs in: its INI and log, the status tooltip, starting and
; stopping the loop, named taps, the probe, and the shared hotkeys (F8 start/stop, F7 probe,
; F10 reload the INI, F12 exit). A macro includes AdbScreen.ahk and this file, then calls
; MacroInit with its own parts.

; The running macro's parts, set by MacroInit: Title, IniPath, Defaults, Counters, Tag, Probe,
; Run and Keys (see MacroInit).
global Macro := {}
global Cfg := Map()
global Running := false
global Probing := false
global Phase := "idle"
; Knobs every macro has, read with its own: [Status] TipWindow is the window the tooltips sit on
; (AutoHotkey WinTitle syntax; the title matches anywhere in it).
global CORE_DEFAULTS := Map("Status", Map("TipWindow", "CookieRun: Crumble ahk_exe MuMuNxDevice.exe"))

; Tooltips go where TipAt puts them on the screen, not relative to whatever window is active.
CoordMode("ToolTip", "Screen")

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
 * Sets up a macro: reads its INI, shows the status tooltip, and starts the loop when the script
 * was run with /start.
 * @param parts an object with:
 *   - Title: the name in the status tooltip, e.g. "Conquest loop"
 *   - IniPath: the INI's full path
 *   - Defaults: Map of section -> Map of key -> fallback, for keys missing from the INI
 *   - Counters: function returning the tooltip's counts, e.g. "runs 12"
 *   - Tag: function returning the log line's bracketed context, e.g. "run 12"
 *   - Probe: function taking a capture and returning the probe tooltip's text
 *   - Run: the loop, run on its own thread by F8
 *   - Keys: extra hotkey help for the tooltip, e.g. "  F9 learn"; may be empty
 */
MacroInit(parts) {
    global Macro
    Macro := parts
    LoadConfig()
    UpdateStatus()
    for arg in A_Args
        if (arg = "/start")
            ToggleRun()
}

/**
 * Reads every knob from the INI into Cfg, falling back to the macro's defaults and the core's.
 */
LoadConfig() {
    global Cfg
    Cfg := Map()
    for defaults in [CORE_DEFAULTS, Macro.Defaults]
        for section, keys in defaults
            for key, fallback in keys
                Cfg[key] := Trim(IniRead(Macro.IniPath, section, key, fallback))
}

/**
 * Places a tooltip line on the game's window, so it stays put whatever window is active.
 * @param row 1 for the status line, 2 for the probe under it
 * @returns {x, y} in screen pixels: inside the window's top-left corner, below its title bar;
 *   the screen's top-left corner when the window isn't open
 */
TipAt(row) {
    dy := row = 1 ? 0 : 50
    if WinExist(Cfg.Get("TipWindow", "")) {
        WinGetPos(&x, &y)
        return {x: x + 10, y: y + 40 + dy}
    }
    return {x: 10, y: 10 + dy}
}

/**
 * Returns the numeric value of a knob.
 * @param key knob name, e.g. "PollMs"
 * @returns the number
 * @throws Error when the INI value isn't numeric
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
    line := FormatTime(, "yyyy-MM-dd HH:mm:ss") " [" Macro.Tag.Call() "] " msg "`n"
    loop 5 {
        try {
            FileAppend(line, A_ScriptDir "\" Cfg["LogFile"], "UTF-8")
            return
        }
        Sleep 100
    }
}

/**
 * Appends rows to a CSV next to the script, writing its header first when it creates the file.
 * A write that fails (another program holding the file open, say) is retried briefly and then
 * logged, never raised.
 * @param name the file's name, e.g. "conquest-runs.csv"
 * @param header the column names, comma-separated
 * @param rows the rows, each ending in a newline
 */
AppendCsv(name, header, rows) {
    path := A_ScriptDir "\" name
    loop 5 {
        try {
            if !FileExist(path)
                FileAppend(header "`n", path, "UTF-8-RAW")
            FileAppend(rows, path, "UTF-8-RAW")
            return
        }
        Sleep 100
    }
    Log("couldn't write " name)
}

/**
 * Shows the status tooltip on the game's window.
 * @param extra optional detail appended after the phase
 */
UpdateStatus(extra := "") {
    state := Running ? "RUNNING" : "stopped"
    at := TipAt(1)
    ToolTip(Macro.Title ": " state " | " Macro.Counters.Call() " | " Phase (extra ? " " extra : "")
        . "`nF8 start/stop  F7 probe" Macro.Keys "  F10 reload ini  F12 exit", at.x, at.y, 1)
}

/**
 * Sleeps in short slices, unwinding when the loop is stopped.
 * @param ms duration in milliseconds
 * @throws StopSignal when F8 stops the loop mid-wait
 */
Wait(ms) {
    finish := A_TickCount + ms
    while (A_TickCount < finish) {
        CheckStop()
        UpdateStatus()
        Sleep 200
    }
}

/**
 * Unwinds the run thread once F8 has stopped the loop.
 * @throws StopSignal when the loop is stopped
 */
CheckStop() {
    if !Running
        throw StopSignal()
}

/**
 * Taps a named point in game pixels, with a random offset of up to JitterPx.
 * @param name point prefix in [Points], e.g. "Enter" reads EnterX / EnterY
 * @throws Error from GameDisplay when "auto" can't find the game
 */
Tap(name) {
    p := TapAt(N(name "X"), N(name "Y"), N("JitterPx"))
    Log("tap " name " @ " p.x "," p.y)
}

/**
 * Saves the current screen to stops\ next to the script, so a stop or a recovery can be explained.
 * @param prefix put before the time in the file's name, e.g. "unread_358-27_"; may be empty
 * @returns a log line naming the file, or saying none could be saved
 */
SaveStopShot(prefix := "") {
    dir := A_ScriptDir "\stops"
    try DirCreate(dir)
    name := prefix FormatTime(, "yyyy-MM-dd_HHmmss") ".png"
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
    SetTimer(RunThread, -1)
}

/**
 * Runs the macro's loop and returns the macro to idle when it ends, however it ends.
 */
RunThread() {
    global Running, Phase
    Macro.Run.Call()
    Running := false
    Phase := "idle"
    UpdateStatus()
}

/**
 * F7: toggles a probe that captures the screen every 2 s and shows what the macro sees.
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
    try
        text := Macro.Probe.Call(Capture())
    catch Error as e
        text := e.Message
    at := TipAt(2)
    ToolTip(text, at.x, at.y, 2)
}
