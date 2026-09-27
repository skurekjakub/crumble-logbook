#Requires AutoHotkey v2.0
#SingleInstance Force
; Guild Conquest retry loop: lobby -> Enter -> wait the full fight -> dismiss results -> repeat.
; Every position, colour and delay is read from conquest-loop.ini; see README.md for tuning.

SetTitleMatchMode 2
CoordMode "Mouse", "Screen"
CoordMode "Pixel", "Screen"
CoordMode "ToolTip", "Screen"

global IniPath := A_ScriptDir "\conquest-loop.ini"
global Cfg := Map()
global Running := false
global Probing := false
global Runs := 0
global Phase := "idle"

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Window", Map("Title", "CookieRun", "GameAspect", "0", "ClickMethod", "Click", "SendMode", "Input"),
    "Points", Map("EnterX", "0.50", "EnterY", "0.88", "ConfirmX", "0.62", "ConfirmY", "0.60",
                  "DismissX", "0.50", "DismissY", "0.93", "LobbyPixelX", "0.50", "LobbyPixelY", "0.88"),
    "Timing", Map("ConfirmEnabled", "0", "ConfirmDelayMs", "1500", "PostEnterDelayMs", "6000",
                  "FightSeconds", "60", "EndBufferMs", "5000", "DismissTaps", "3", "DismissIntervalMs", "1500",
                  "PostDismissDelayMs", "3000", "ClickHoldMs", "60", "JitterPx", "3"),
    "Detect", Map("UseLobbyColor", "1", "LobbyColor", "0xF7931E", "ColorTolerance", "40",
                  "LobbyTimeoutMs", "30000", "EscapeOnStuck", "1", "StuckLimit", "5"),
    "Run", Map("MaxRuns", "0", "LogFile", "conquest-loop.log")
)

; The section each key lives in, so calibration writes land in the right place.
global KEY_SECTION := Map()
for section, keys in DEFAULTS
    for key in keys
        KEY_SECTION[key] := section

LoadConfig()
UpdateStatus()

F7:: ToggleProbe()
F8:: ToggleRun()
F9:: Calibrate()
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
 * Reads every knob from the INI into Cfg, falling back to DEFAULTS, and applies SendMode.
 * Throws if SendMode holds a value AutoHotkey rejects.
 */
LoadConfig() {
    global Cfg
    Cfg := Map()
    for section, keys in DEFAULTS
        for key, fallback in keys
            Cfg[key] := Trim(IniRead(IniPath, section, key, fallback))
    SendMode Cfg["SendMode"]
}

/**
 * Returns the numeric value of a knob.
 * @param key knob name, e.g. "FightSeconds"
 * @returns Number; throws if the INI value isn't numeric
 */
N(key) {
    return Number(Cfg[key])
}

/**
 * Writes one knob to the INI (in its own section) and reloads the config.
 * @param key knob name
 * @param value value to store
 */
SaveKey(key, value) {
    IniWrite(value, IniPath, KEY_SECTION[key], key)
    LoadConfig()
}

/**
 * Appends a timestamped line to the log file next to the script.
 * @param msg text to log
 */
Log(msg) {
    FileAppend(FormatTime(, "yyyy-MM-dd HH:mm:ss") " [run " Runs "] " msg "`n", A_ScriptDir "\" Cfg["LogFile"], "UTF-8")
}

/**
 * Shows the status tooltip in the top-left corner of the screen.
 * @param extra optional detail appended after the phase
 */
UpdateStatus(extra := "") {
    state := Running ? "RUNNING" : "stopped"
    ToolTip("Conquest loop: " state " | runs " Runs " | " Phase (extra ? " " extra : "")
        . "`nF8 start/stop  F7 probe  F9 calibrate  F10 reload ini  F12 exit", 10, 10, 1)
}

/**
 * Locates the game's drawing area in screen pixels. With GameAspect > 0 the portrait game is
 * assumed centred inside the window's client area (pillarboxed or letterboxed); with 0 the whole
 * client area is the game.
 * @returns {x, y, w, h}; throws if no window matches Title
 */
GameRect() {
    title := Cfg["Title"]
    if !WinExist(title)
        throw Error("game window not found (Title=" title ")")
    WinGetClientPos(&cx, &cy, &cw, &ch, title)
    aspect := N("GameAspect")
    gx := cx, gy := cy, gw := cw, gh := ch
    if (aspect > 0 && cw / ch > aspect) {
        gw := ch * aspect
        gx := cx + (cw - gw) / 2
    } else if (aspect > 0 && cw / ch < aspect) {
        gh := cw / aspect
        gy := cy + (ch - gh) / 2
    }
    return {x: gx, y: gy, w: gw, h: gh}
}

/**
 * Converts a named point's relative coordinates (0..1 of the game area) to screen pixels.
 * @param name point prefix in [Points], e.g. "Enter" reads EnterX / EnterY
 * @returns {x, y}
 */
PointOf(name) {
    r := GameRect()
    return {x: Round(r.x + N(name "X") * r.w), y: Round(r.y + N(name "Y") * r.h)}
}

/**
 * Taps a named point with optional jitter, by mouse click or ControlClick (ClickMethod).
 * @param name point prefix in [Points]
 */
Tap(name) {
    p := PointOf(name)
    j := N("JitterPx")
    x := p.x + (j > 0 ? Random(-j, j) : 0)
    y := p.y + (j > 0 ? Random(-j, j) : 0)
    title := Cfg["Title"]
    if (Cfg["ClickMethod"] = "ControlClick") {
        ; ControlClick takes client coordinates and doesn't need the window focused.
        WinGetClientPos(&cx, &cy, , , title)
        ControlClick("x" (x - cx) " y" (y - cy), title, , , , "NA")
    } else {
        WinActivate(title)
        MouseMove(x, y, 0)
        Sleep 30
        Click "Down"
        Sleep N("ClickHoldMs")
        Click "Up"
    }
    Log("tap " name " @ " x "," y)
}

/**
 * Compares two 0xRRGGBB colours channel by channel.
 * @param c observed colour
 * @param target expected colour
 * @param tol maximum difference allowed per channel
 * @returns true when every channel is within tol
 */
ColorMatches(c, target, tol) {
    loop 3 {
        shift := (A_Index - 1) * 8
        if Abs(((c >> shift) & 0xFF) - ((target >> shift) & 0xFF)) > tol
            return false
    }
    return true
}

/**
 * Tells whether the lobby's Enter button is on screen, by the colour at LobbyPixel.
 * @returns true when detection is off (UseLobbyColor=0) or the colour matches LobbyColor
 */
LobbyReady() {
    if !N("UseLobbyColor")
        return true
    p := PointOf("LobbyPixel")
    return ColorMatches(PixelGetColor(p.x, p.y), Integer(Cfg["LobbyColor"]), N("ColorTolerance"))
}

/**
 * Sleeps in short slices, refreshing the countdown and unwinding when the loop is stopped.
 * @param ms duration in milliseconds
 * @throws StopSignal when F8 stops the loop mid-wait
 */
Wait(ms) {
    finish := A_TickCount + ms
    while (A_TickCount < finish) {
        if !Running
            throw StopSignal()
        UpdateStatus(Ceil((finish - A_TickCount) / 1000) "s")
        Sleep 200
    }
}

/**
 * Blocks until the lobby is showing, tapping Dismiss meanwhile to clear result screens and popups.
 * Each LobbyTimeoutMs without the lobby counts as stuck (Esc is sent if EscapeOnStuck=1);
 * StuckLimit consecutive stalls stop the loop rather than tapping blindly.
 * @throws Error after StuckLimit consecutive stalls
 */
WaitForLobby() {
    stalls := 0
    while !LobbyReady() {
        deadline := A_TickCount + N("LobbyTimeoutMs")
        while (A_TickCount < deadline && !LobbyReady()) {
            Tap("Dismiss")
            Wait(N("DismissIntervalMs"))
        }
        if LobbyReady()
            break
        stalls += 1
        Log("lobby not detected after " N("LobbyTimeoutMs") " ms (stall " stalls ")")
        if (stalls >= N("StuckLimit"))
            throw Error("lobby not detected " stalls " times in a row; check LobbyPixel / LobbyColor")
        if N("EscapeOnStuck") {
            WinActivate(Cfg["Title"])
            Send "{Esc}"
        }
    }
}

/**
 * Clears the result screens: taps Dismiss up to DismissTaps times, stopping early once the
 * lobby is back so a tap never lands on Enter by accident.
 */
DismissResults() {
    loop N("DismissTaps") {
        if (N("UseLobbyColor") && LobbyReady())
            return
        Tap("Dismiss")
        Wait(N("DismissIntervalMs"))
    }
    Wait(N("PostDismissDelayMs"))
}

/**
 * The retry loop, run on its own thread by ToggleRun. Always waits the whole fight
 * (FightSeconds) even when the team wipes early, so surviving cookies keep scoring.
 */
RunLoop() {
    global Runs, Phase, Running
    try {
        while Running {
            if (N("MaxRuns") > 0 && Runs >= N("MaxRuns")) {
                Log("MaxRuns reached")
                break
            }
            Phase := "waiting for lobby"
            WaitForLobby()
            Phase := "enter"
            Tap("Enter")
            Runs += 1
            Log("entered")
            if N("ConfirmEnabled") {
                Wait(N("ConfirmDelayMs"))
                Tap("Confirm")
            }
            Phase := "loading"
            Wait(N("PostEnterDelayMs"))
            Phase := "fight"
            Wait(N("FightSeconds") * 1000)
            Phase := "results"
            Wait(N("EndBufferMs"))
            DismissResults()
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        TrayTip(e.Message, "Conquest loop stopped", 3)
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
 * F7: toggles a live probe tooltip with the cursor's position relative to the game area and
 * the pixel colour under it, for calibrating by hand.
 */
ToggleProbe() {
    global Probing
    Probing := !Probing
    SetTimer(ShowProbe, Probing ? 100 : 0)
    if !Probing
        ToolTip(, , , 2)
}

/**
 * Draws the probe tooltip next to the cursor.
 */
ShowProbe() {
    MouseGetPos(&mx, &my)
    try {
        r := GameRect()
        text := Format("rel {:.4f}, {:.4f}   0x{:06X}", (mx - r.x) / r.w, (my - r.y) / r.h, PixelGetColor(mx, my))
    } catch Error as e {
        text := e.Message
    }
    ToolTip(text, mx + 20, my + 20, 2)
}

/**
 * F9: offers to store the cursor position (relative to the game area) as one of the tap points;
 * the LobbyPixel entry also stores the colour under the cursor as LobbyColor.
 */
Calibrate() {
    MouseGetPos(&mx, &my)
    try r := GameRect()
    catch Error as e {
        TrayTip(e.Message, "Calibrate", 3)
        return
    }
    rx := Round((mx - r.x) / r.w, 4)
    ry := Round((my - r.y) / r.h, 4)
    color := Format("0x{:06X}", PixelGetColor(mx, my))
    m := Menu()
    for name in ["Enter", "Confirm", "Dismiss"]
        m.Add("Set " name " here", SavePointHandler.Bind(name, rx, ry, ""))
    m.Add("Set LobbyPixel + colour here", SavePointHandler.Bind("LobbyPixel", rx, ry, color))
    m.Add()
    m.Add("rel " rx ", " ry "   colour " color, (*) => 0)
    m.Disable("rel " rx ", " ry "   colour " color)
    m.Show()
}

/**
 * Menu callback for Calibrate: saves a point (and optionally LobbyColor) to the INI.
 * @param name point prefix
 * @param rx relative x
 * @param ry relative y
 * @param color colour to save as LobbyColor, or "" to leave it
 */
SavePointHandler(name, rx, ry, color, *) {
    SaveKey(name "X", rx)
    SaveKey(name "Y", ry)
    if (color != "")
        SaveKey("LobbyColor", color)
    UpdateStatus("saved " name " = " rx ", " ry (color != "" ? " " color : ""))
}
