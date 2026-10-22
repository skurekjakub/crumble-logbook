; The boss loop the stage and rift macros share: on the Summon button, it reads the stage's number,
; taps the button and plays the stage's movement script (README in tools/stage-macro), so the team
; walks onto the boss as the encounter opens. A lost boss brings the button back within seconds
; and the loop tries again; a beaten one moves the game on to the next stage. A macro includes
; AdbScreen.ahk, Macro.ahk, Hud.ahk and this file, then calls BossLoopInit with its own parts.

global Passes := 0
global Fails := 0
; The running macro's parts, set by BossLoopInit (see there).
global Boss := {}
; The stage being fought or next up, e.g. "358-20" or "rift-12": read off the screen when the
; reader can, carried forward from the last result when it can't, and kept in Boss.StateFile
; across restarts. Empty until first known.
global Current := ""
; Tries this session, by stage; the stages whose unreadable number was saved for teaching.
global Tries := Map()
global UnreadSaved := Map()
; The screen the last poll classified, so the log records each change once.
global LastScreen := ""
; How long a capture takes, in ms, averaged over recent ones, so Watch knows whether one still fits
; before a wait's end. Starts at a typical capture's time over MuMu's adb.
global CaptureMs := 1500
; The lowest boss health a lost try left, in percent, by stage: from RunsFile at start, then each try.
global Lowest := Map()
; Set when tending the oven went wrong, so the loop leaves the oven alone for the rest of the run.
global OvenGaveUp := false

; Fallbacks every boss macro has, for keys missing from its INI. Section -> key -> value. A macro's
; own defaults are laid over these.
global BOSS_DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "127.0.0.1:5557",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("JitterPx", "6"),
    "Detect", Map("Boss", "320,380,FF632D|360,380,FF632D|320,400,FF3617|380,400,FF3617",
                  "Transition", "300,800,271D1D|720,1200,271D1D|1100,1000,271D1D|300,1400,271D1D|1100,600,271D1D",
                  "Tolerance", "30", "HpBar", "416,1170,438", "HpEmptyMax", "112"),
    "Timing", Map("PollMs", "1000", "ClearingPollMs", "3000", "UnreadLimit", "10", "StartWaitMs", "25000",
                  "PassAfterMs", "30000"),
    "Stages", Map("ScriptDir", "stages", "WaitForScript", "1"),
    "Record", Map("Video", "unscripted", "Seconds", "45", "BitRate", "4000000", "VideoDir", "recordings"),
    "Run", Map("MaxTries", "0"),
    "Hud", Map("Node", "node"),
    "Oven", Map("TendOven", "0", "OvenWaitMs", "5000",
                "OvenIdle", "470,2280|570,2275|475,2315|575,2315", "OvenIdleMargin", "30",
                "OvenStackX", "720", "OvenStackY", "2173", "OvenSellAllX", "1285", "OvenSellAllY", "2250",
                "OvenConfirmX", "992", "OvenConfirmY", "2250", "OvenCloseX", "715", "OvenCloseY", "2453",
                "OvenAutoX", "520", "OvenAutoY", "2283", "OvenStartX", "715", "OvenStartY", "2250",
                "OvenResults", "300,1616,007E91|1100,1616,007E91|830,2240,FD9500|1285,2215,14AEB8",
                "OvenConfirm", "600,2240,14AEB8|830,2240,FD9500|1100,2220,FD9500",
                "OvenSettings", "200,419,007E91|1240,419,007E91|600,2240,FD9500|830,2240,FD9500")
)

/**
 * Sets up a boss macro: loads the stage it left off at, and hands the loop to MacroInit.
 * @param parts an object with:
 *   - Title: the name in the status tooltip, e.g. "Rift loop"
 *   - IniPath: the INI's full path
 *   - StateFile: the full path of the file that keeps the stage across restarts
 *   - Defaults: Map of section -> Map of key -> fallback, laid over BOSS_DEFAULTS. It gives the
 *     Summon button's point (SummonX, SummonY), its signature ([Detect] Summon), and the log and
 *     runs files (LogFile, RunsFile)
 *   - Hud: the tools/hud read that takes the stage's number off the Summon screen, which is also
 *     the field it prints, e.g. "stage"
 *   - NumOf: function taking the read's value and returning the stage's number
 *   - ScriptPath: function taking a stage's number and returning its script's path
 *   - NextStage: function taking a beaten stage's number and returning the next one's
 *   - Ids: {Header, Of, NumOfRow}: the runs file's columns naming the stage, e.g.
 *     "chapter,stage,world"; a function taking a stage's number and returning those columns'
 *     values, comma-separated; and a function taking a row, a Map of column -> value, and
 *     returning its stage's number
 */
BossLoopInit(parts) {
    global Boss, Current
    Boss := parts
    try Current := Trim(FileRead(parts.StateFile, "UTF-8"), " `r`n")
    defaults := Map()
    for layer in [BOSS_DEFAULTS, parts.Defaults]
        for section, keys in layer {
            if !defaults.Has(section)
                defaults[section] := Map()
            for key, value in keys
                defaults[section][key] := value
        }
    MacroInit({Title: parts.Title, IniPath: parts.IniPath, Defaults: defaults,
        Counters: () => "passes " Passes " | fails " Fails (Lowest.Has(Current) ? " | lowest " Lowest[Current] "%" : ""),
        Tag: () => Current = "" ? "-" : Current " #" Tries.Get(Current, 0),
        Probe: ProbeText, Run: RunLoop, Keys: ""})
}

/**
 * Classifies a capture.
 * @param buf capture from Capture()
 * @returns "boss" (a boss encounter), "summon" (the Summon button shows: the stage is ready for
 *   its boss, or its boss just won), or "other" (the stage's enemies, a banner or a transition)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Boss"])
        return "boss"
    if Shows(buf, Cfg["Summon"])
        return "summon"
    return "other"
}

/**
 * Reads the boss's health off its bar in an encounter's HUD: where, going right along the bar's row,
 * the dark empty part begins. The percentage is written in white across the bar and red damage
 * numbers float over it, but neither is dark, so neither moves that point.
 * @param buf capture from Capture() of an encounter
 * @returns the health in percent, 0-100
 */
BossHp(buf) {
    bar := StrSplit(Cfg["HpBar"], ",")
    left := Integer(bar[1]), right := Integer(bar[2]), y := Integer(bar[3])
    dark := N("HpEmptyMax")
    run := 0
    x := left
    while (x <= right) {
        c := Pixel(buf, x, y)
        ; Two dark samples in a row, so a lone dark pixel of an effect doesn't end the fill.
        run := ((c >> 16) <= dark && ((c >> 8) & 0xFF) <= dark && (c & 0xFF) <= dark) ? run + 1 : 0
        if (run = 2)
            return Round(100 * (x - 2 - left) / (right - left))
        x += 2
    }
    return 100
}

/**
 * Classifies a capture and logs the screen whenever it differs from the last poll's.
 * @param buf capture from Capture()
 * @returns the screen, as ScreenOf
 */
Observe(buf) {
    global LastScreen
    screen := ScreenOf(buf)
    if (screen != LastScreen) {
        Log("screen: " (LastScreen = "" ? "(start)" : LastScreen) " -> " screen)
        LastScreen := screen
    }
    return screen
}

/**
 * Sets the stage being fought or next up, and keeps it in Boss.StateFile for the next run.
 * @param num the stage's number, e.g. "358-21"
 */
Expect(num) {
    global Current
    Current := num
    try FileDelete(Boss.StateFile)
    try FileAppend(num, Boss.StateFile, "UTF-8-RAW")
}

/**
 * Seconds between two A_TickCount values, for the log.
 * @param from the earlier tick; 0 when it never happened
 * @param to the later tick
 * @returns e.g. "1.5"; "-" when `from` is 0
 */
Secs(from, to) {
    return from ? Format("{:.1f}", (to - from) / 1000) : "-"
}

/**
 * Captures the screen, folding the time it took into CaptureMs.
 * @returns Buffer with the capture, as Capture()
 * @throws Error from Capture() when adb produces no image
 */
TimedCapture() {
    global CaptureMs
    at := A_TickCount
    buf := Capture()
    CaptureMs += (A_TickCount - at - CaptureMs) / 4
    return buf
}

/**
 * Waits out the rest of a poll's period, so polls start every `ms` however long the capture and
 * the work on it took; a poll that took longer starts the next one at once.
 * @param polled A_TickCount when the poll's capture began
 * @param ms the period
 * @throws StopSignal when F8 stops the loop
 */
Pace(polled, ms) {
    CheckStop()
    UpdateStatus()
    Wait(Max(0, polled + ms - A_TickCount))
}

/**
 * Tells which tries [Record] Video records. It's read on every try, so F10 can change it mid-run.
 * @returns "all", "unscripted" (only tries of a stage with no script, whose video the script is
 *   written from) or "off"; 1 reads as "all" and 0 as "off"
 * @throws Error when Video is none of those
 */
RecordMode() {
    v := StrLower(Cfg["Video"])
    switch v {
        case "1": return "all"
        case "0": return "off"
        case "all", "unscripted", "off": return v
    }
    throw Error("[Record] Video is " Cfg["Video"] "; set it to all, unscripted or off")
}

/**
 * The loop, run on its own thread by F8. Polls the screen and logs each screen change: every PollMs
 * while a try is out, and every ClearingPollMs while nothing is deciding (the game clearing enemies,
 * or a stage waiting for its script). Each poll period counts from its capture's start.
 * - When the screen comes to the Summon button, it takes the stage's number from the screen once
 *   (again each poll only while no stage is known and the number stays unreadable), or carries
 *   the expected one forward when the reader can't read it, then taps the button and plays the
 *   stage's script.
 * - While a try is out, Judge follows its encounter to a result.
 * - A stage without a script whose boss won waits for its script (WaitForScript), checking only
 *   that the file exists, so the next try plays it.
 * - With TendOven on, when the Summon screen shows the oven full (OvenFull), it tends the oven
 *   (TendOven) before the next tap.
 * @throws Error, caught here, when the stage's number is unknown and stays unreadable for
 *   UnreadLimit polls on the Summon button, or a stage loses MaxTries times in a row
 */
RunLoop() {
    global Phase, Tries
    pending := ""
    unread := 0
    ; The stage on the Summon screen is settled, read or carried forward, since the screen came to it.
    known := false
    LoadLowest()
    Log("expecting " (Current = "" ? "an unknown stage" : Current))
    try {
        while Running {
            polled := A_TickCount
            buf := TimedCapture()
            screen := Observe(buf)
            if (pending != "") {
                verdict := Judge(pending, screen, buf)
                if (verdict = "") {
                    Pace(polled, N("PollMs"))
                    continue
                }
                if (verdict = "dropped") {
                    Log(Format("Summon Boss still up {} s after the tap: the encounter didn't start; summoning again",
                        Secs(pending.started, A_TickCount)))
                    if (pending.video != "")
                        StopRecording()
                    Tries[pending.num] -= 1
                } else {
                    Settle(pending, verdict)
                    if (verdict = "pass") {
                        Expect(Boss.NextStage.Call(pending.num))
                        Log("expecting " Current " next")
                    }
                }
                pending := ""
            }
            if (screen != "summon") {
                known := false
                Phase := screen = "boss" ? "boss" : "clearing"
                Pace(polled, N("ClearingPollMs"))
                continue
            }
            if !known {
                out := HudRun(Boss.Hud, buf)
                read := HudField(out, Boss.Hud)
                if (read != "") {
                    read := Boss.NumOf.Call(read)
                    if (Current != "" && read != Current)
                        Log("read " read " on Summon Boss where " Current " was expected; going by the read")
                    if (read != Current)
                        Expect(read)
                    unread := 0
                } else {
                    unread += 1
                    Log("stage number unread on Summon Boss (" unread "): " HudLine(out))
                    if (Current != "" && !UnreadSaved.Has(Current)) {
                        UnreadSaved[Current] := true
                        Log("for teaching the reader: " SaveStopShot("unread_" Current "_"))
                    }
                    if (Current = "") {
                        if (unread >= N("UnreadLimit"))
                            throw Error("can't read the stage's number on Summon Boss and none is expected; F7 shows what the reader sees")
                        Phase := "reading the stage " unread "/" N("UnreadLimit")
                        Pace(polled, N("PollMs"))
                        continue
                    }
                    Log("going by the expected " Current)
                }
                known := true
            }
            script := Boss.ScriptPath.Call(Current)
            if (Tries.Get(Current, 0) > 0 && !FileExist(script) && N("WaitForScript")) {
                if (Phase != "waiting for a script")
                    Log("waiting for " StrReplace(script, A_ScriptDir "\") " before trying again")
                Phase := "waiting for a script"
                Pace(polled, N("ClearingPollMs"))
                continue
            }
            if (N("MaxTries") > 0 && Tries.Get(Current, 0) >= N("MaxTries"))
                throw Error(Current " lost " Tries[Current] " times in a row; tune " StrReplace(script, A_ScriptDir "\"))
            if (N("TendOven") && !OvenGaveUp && OvenFull(buf)) {
                TendOven()
                Pace(polled, N("PollMs"))
                continue
            }
            unread := 0
            ; The screen comes back to the Summon button after the try, and its stage is read afresh.
            known := false
            pending := Attempt(Current, script)
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        Log(SaveStopShot())
        TrayTip(e.Message, Boss.Title " stopped", 3)
    }
}

/**
 * Follows a try's encounter, one poll at a time, to a result. It needs no stage number: a lost
 * boss brings the Summon button back within seconds, while a beaten one sends the game back to
 * clearing enemies, where the button stays away for minutes.
 * It also reads the boss's health on every capture of the encounter, logging it each time it falls
 * past another 10%.
 * @param a the try from Attempt; its seen and ended ticks are filled in, its hp, and its reason on
 *   a result
 * @param screen the poll's screen, from Observe
 * @param buf the poll's capture
 * @returns "fail" when the Summon button shows after the encounter; "pass" when it hasn't
 *   PassAfterMs after the encounter ended; "dropped" when it is still up StartWaitMs after the tap
 *   with no encounter seen; empty while the result isn't in
 */
Judge(a, screen, buf) {
    now := A_TickCount
    if (screen = "boss") {
        if !a.seen {
            a.seen := now
            Log(Format("encounter showing, {} s after the scene change", Secs(a.changed, now)))
        } else if a.ended {
            Log(Format("encounter showing again after {} s away", Secs(a.ended, now)))
        }
        a.ended := 0
        hp := BossHp(buf)
        if (hp < a.hp) {
            if (hp // 10 < a.hp // 10 || a.hp = 101)
                Log(Format("boss at {}% at +{} s", hp, Secs(a.changed, now)))
            a.hp := hp
        }
        return ""
    }
    if !a.seen
        return (screen = "summon" && now - a.started >= N("StartWaitMs")) ? "dropped" : ""
    if !a.ended {
        a.ended := now
        Log(Format("encounter gone after {} s, to the {} screen", Secs(a.seen, now), screen))
    }
    if (screen = "summon") {
        a.reason := Format("Summon Boss came back {} s after the encounter", Secs(a.ended, now))
        return "fail"
    }
    if (now - a.ended >= N("PassAfterMs")) {
        a.reason := Format("no Summon Boss for {} s after the encounter", Secs(a.ended, now))
        return "pass"
    }
    return ""
}

/**
 * Fights a stage's boss once: starts the recording when RecordMode wants this try's, taps the
 * Summon button, waits for the scene to change, and plays the stage's script from the change, or
 * from the tap, before waiting, when the script starts with `tap`.
 * @param num the stage's number, e.g. "358-20"
 * @param script the script's path; a missing script plays nothing
 * @returns the try: {num, try, script, video, started, changed, seen, ended, hp, reason}: the
 *   video's name (empty when not recorded), the ticks of the tap and the scene change (0 when it
 *   didn't change), and of the encounter showing and ending (0 until they do), and the boss's
 *   lowest health in percent (101 until read), which Judge fills in
 * @throws Error from RecordMode when [Record] Video isn't a mode; StopSignal when F8 stops the loop
 *   mid-script
 */
Attempt(num, script) {
    global Phase, Tries
    mode := RecordMode()
    Tries[num] := Tries.Get(num, 0) + 1
    rel := StrReplace(script, A_ScriptDir "\")
    has := FileExist(script) != ""
    Log(Format("try {} on {}: {}", Tries[num], num, has ? "script " rel : "no script at " rel))
    video := (mode = "all" || (mode = "unscripted" && !has)) ? VideoName(num, Tries[num]) : ""
    if (video != "") {
        RecordScreen("/sdcard/stage-boss.mp4", N("Seconds"), "--bit-rate " Cfg["BitRate"])
        ; screenrecord takes a moment to start; without this the first frames of the scene change are lost.
        Sleep 300
        Log("recording, to be saved as " Cfg["VideoDir"] "\" video)
    }
    steps := has ? ReadSteps(script) : []
    fromTap := PlaysFromTap(steps)
    Phase := "summoning"
    Tap("Summon")
    started := A_TickCount
    a := {num: num, try: Tries[num], script: has ? rel : "", video: video, started: started,
        changed: 0, seen: 0, ended: 0, hp: 101, reason: ""}
    if fromTap
        TryScript(steps, a, started, rel)
    a.changed := SceneChange(started)
    Log(a.changed ? Format("scene changed {} s after the tap", Secs(started, a.changed))
        : Format("Summon Boss still up {} s after the tap", Secs(started, A_TickCount)))
    if (has && !fromTap && a.changed)
        TryScript(steps, a, a.changed, rel)
    Phase := "boss"
    return a
}

/**
 * Tells whether Auto Bake has stopped, which it does once its results fill the oven: its Auto
 * button is teal then, and orange while it bakes. Each OvenIdle point must be teal, its green and
 * blue both over its red by OvenIdleMargin; the button pulses, so no single colour fits.
 * @param buf capture from Capture() of the Summon screen
 * @returns true when every point is teal
 */
OvenFull(buf) {
    margin := N("OvenIdleMargin")
    for part in StrSplit(Cfg["OvenIdle"], "|") {
        p := StrSplit(Trim(part), ",")
        c := Pixel(buf, Integer(p[1]), Integer(p[2]))
        r := c >> 16, g := (c >> 8) & 0xFF, b := c & 0xFF
        if (g < r + margin || b < r + margin)
            return false
    }
    return true
}

/**
 * Sells everything Auto Bake has baked and starts Auto Bake again, for the oven's experience: taps
 * the oven's stack of results, Sell All, the confirmation the game asks for when some of it beats
 * the equipped gear, then Auto and Start, which keeps Auto Bake's saved settings. Only for a full
 * oven (OvenFull): with few results the window has no Sell All, and the stack, tapped while
 * baking, opens one item's card instead. Each window is checked by its signature before its
 * button is tapped; one that doesn't show within OvenWaitMs ends the routine with an "oven error"
 * line and a saved screen, and the loop leaves the oven alone for the rest of the run.
 * @throws StopSignal when F8 stops the loop
 */
TendOven() {
    global Phase
    Phase := "tending the oven"
    Log("oven: selling the Auto Bake results")
    Tap("OvenStack")
    if !AwaitSignature("OvenResults", true)
        return OvenError("the Auto Bake results didn't open")
    Tap("OvenSellAll")
    if AwaitSignature("OvenConfirm", true)
        Tap("OvenConfirm")
    if !AwaitSignature("OvenResults", false) {
        Log("oven: the results stayed open after Sell All; closing them")
        Tap("OvenClose")
        if !AwaitSignature("OvenResults", false)
            return OvenError("the Auto Bake results wouldn't close")
    }
    ; The closing results swallow taps for a moment after their signature has gone: Auto waits for
    ; its idle colour, and gets a second tap if the settings still don't open.
    if !AwaitScreen(OvenFull)
        return OvenError("the oven's Auto button didn't come back after the sale")
    Tap("OvenAuto")
    if !AwaitSignature("OvenSettings", true) {
        Log("oven: the Auto Bake settings didn't open; tapping Auto again")
        Tap("OvenAuto")
        if !AwaitSignature("OvenSettings", true)
            return OvenError("the Auto Bake settings didn't open")
    }
    Tap("OvenStart")
    if !AwaitSignature("OvenSettings", false)
        return OvenError("the Auto Bake settings stayed open after Start")
    Log("oven: Auto Bake started again")
}

/**
 * Captures until a window's signature shows, or stops showing.
 * @param name the [Oven] signature's key, e.g. "OvenResults"
 * @param shown true to wait for it to show, false to wait for it to go
 * @returns true when it did within OvenWaitMs
 * @throws StopSignal when F8 stops the loop
 */
AwaitSignature(name, shown) {
    return AwaitScreen((buf) => Shows(buf, Cfg[name]) = shown)
}

/**
 * Captures until a capture passes a test.
 * @param test function taking a capture from Capture() and returning true when it is the one
 * @returns true when one did within OvenWaitMs
 * @throws StopSignal when F8 stops the loop
 */
AwaitScreen(test) {
    deadline := A_TickCount + N("OvenWaitMs")
    while (A_TickCount < deadline) {
        CheckStop()
        if test(TimedCapture())
            return true
        Wait(300)
    }
    return false
}

/**
 * Logs why tending the oven stopped short, with the screen saved to stops\, and stops the loop
 * tending it for the rest of the run.
 * @param why what didn't happen
 */
OvenError(why) {
    global OvenGaveUp
    OvenGaveUp := true
    Log("oven error: " why "; leaving the oven alone until a restart; " SaveStopShot("oven_"))
}

/**
 * Waits for the scene to change for the encounter after the tap on the Summon button: the solid
 * dark transition screen, or the encounter itself when a capture misses the transition. The change
 * usually comes about 1 s after the tap, but has taken over 11 s. The button merely leaving the
 * screen isn't enough: right after a loss the button is still settling in and a capture can miss
 * it, which once started a script 14 s before its encounter.
 * @param started A_TickCount of the tap
 * @returns A_TickCount of the capture that showed the change; 0 when none did StartWaitMs after
 *   the tap
 * @throws StopSignal when F8 stops the loop
 */
SceneChange(started) {
    while (A_TickCount - started < N("StartWaitMs")) {
        CheckStop()
        at := A_TickCount
        buf := TimedCapture()
        if (Shows(buf, Cfg["Transition"]) || Shows(buf, Cfg["Boss"]))
            return at
    }
    return 0
}

/**
 * Reads a movement script's steps: its lines with `;` comments and blank lines dropped.
 * @param path the script's path
 * @returns [{line, step}]: each step's line number and its text, trimmed and lowercased
 */
ReadSteps(path) {
    steps := []
    for i, line in StrSplit(FileRead(path, "UTF-8"), "`n", "`r") {
        step := StrLower(Trim(RegExReplace(line, ";.*$")))
        if (step != "")
            steps.Push({line: i, step: step})
    }
    return steps
}

/**
 * Tells whether a movement script plays from the tap on the Summon button: its first step is `tap`.
 * @param steps the script's steps, from ReadSteps
 * @returns true when it does
 */
PlaysFromTap(steps) {
    return steps.Length > 0 && steps[1].step = "tap"
}

/**
 * Plays a movement script with PlayScript, logging an error in it rather than throwing, so the
 * try goes on to its result.
 * @param steps the script's steps, from ReadSteps
 * @param a the try from Attempt
 * @param from A_TickCount the script counts from
 * @param rel the script's path for the status line
 * @throws StopSignal when F8 stops the loop
 */
TryScript(steps, a, from, rel) {
    global Phase
    Phase := "playing " rel
    try {
        PlayScript(steps, a, from)
    } catch Error as e {
        if (e is StopSignal)
            throw e
        Log("script stopped: " e.Message)
    }
}

/**
 * Plays a movement script, logging each step with its time from `from`.
 * - `tap`, only as the first step: the script plays from the tap on the Summon button, with no
 *   capture before it, instead of from the scene change.
 * - `wait <ms>`: does nothing for that long, while following the encounter (Watch); in a script
 *   that starts with `tap`, without capturing.
 * - `encounter`: waits for the encounter's map, the first capture after the scene change that
 *   isn't the transition's dark screen, capturing back to back. The team can walk from then, a
 *   second or more before the boss's HUD shows. Not in a script that starts with `tap`.
 * - `<keys> <ms>`: holds W, A, S or D, or several joined by +, e.g. `W+D 1200`, for that long.
 * The script stops early once the encounter has ended.
 * @param steps the script's steps, from ReadSteps
 * @param a the try from Attempt
 * @param from A_TickCount the script counts from: the scene change, or the tap for a `tap` script
 * @throws Error naming the line when a step isn't one of those, `tap` isn't first, or `encounter`
 *   follows `tap`; StopSignal when F8 stops the loop
 */
PlayScript(steps, a, from) {
    fromTap := PlaysFromTap(steps)
    for i, s in steps {
        step := s.step
        if (step = "tap") {
            if (i > 1)
                throw Error("line " s.line ": tap must be the first step")
            Log("script plays from the tap")
            continue
        }
        if !RegExMatch(step, "^(?:(encounter)|(wait|[wasd](?:\+[wasd])*)\s+(\d+))$", &m)
            throw Error("line " s.line " isn't a step: " step)
        if (m[1] != "" && fromTap)
            throw Error("line " s.line ": encounter can't follow tap")
        CheckStop()
        Log(Format("step at +{} s: {}", Secs(from, A_TickCount), step))
        if (m[1] != "") {
            ; Captures back to back, without a poll's wait between them: every moment the walk
            ; starts late is one the team spends short of the boss.
            shown := 0
            while (A_TickCount - from < N("StartWaitMs")) {
                CheckStop()
                at := A_TickCount
                buf := TimedCapture()
                screen := Observe(buf)
                Judge(a, screen, buf)
                if (screen = "summon")
                    break
                if !Shows(buf, Cfg["Transition"]) {
                    shown := at
                    break
                }
            }
            Log(shown ? Format("map showing at +{} s", Secs(from, shown))
                : "script stopped: no map " N("StartWaitMs") " ms after the scene change")
            if !shown
                return
            continue
        }
        if (m[2] = "wait") {
            ; A capture can overrun a wait's end, so a tap script's timing never waits on one.
            if fromTap {
                Wait(Integer(m[3]))
                continue
            }
            if !Watch(a, Integer(m[3])) {
                Log(Format("script stopped at +{} s: the encounter has ended", Secs(from, A_TickCount)))
                return
            }
            continue
        }
        keys := []
        for k in StrSplit(StrUpper(m[2]), "+")
            keys.Push("KEYCODE_" k)
        HoldKeys(keys, Integer(m[3]))
    }
    Log(Format("script done at +{} s", Secs(from, A_TickCount)))
}

/**
 * Waits while following a try's encounter, polling the screen into Judge, so a script's long
 * wait neither hides when the encounter showed nor plays on past its end.
 * @param a the try from Attempt; Judge fills in its ticks
 * @param ms how long to wait
 * @returns false once the encounter has been gone 2 s; true when the wait ran out with it still on
 *   or not yet shown
 * @throws StopSignal when F8 stops the loop
 */
Watch(a, ms) {
    deadline := A_TickCount + ms
    loop {
        ; A capture that can't finish, and be judged, before the deadline would hold up the next step.
        if (deadline - A_TickCount > CaptureMs + 200) {
            buf := TimedCapture()
            Judge(a, Observe(buf), buf)
            ; A blast over the boss icon can hide the encounter for a poll; gone 2 s is over.
            if (a.ended && A_TickCount - a.ended >= 2000)
                return false
        }
        left := deadline - A_TickCount
        if (left <= 0)
            return true
        Wait(Min(N("PollMs"), left))
    }
}

/**
 * Logs how a try ended, appends it to RunsFile, and saves its video.
 * @param a the try from Attempt, judged by Judge
 * @param result "pass" or "fail"
 */
Settle(a, result) {
    global Passes, Fails, Tries
    saved := a.video != "" ? SaveVideo(a.video) : ""
    tapToChange := Secs(a.started, a.changed)
    changeToShown := Secs(a.changed, a.seen)
    shownFor := Secs(a.seen, a.ended)
    ; A beaten boss's bar empties as it dies, after the last capture of the encounter.
    hp := result = "pass" ? 0 : a.hp <= 100 ? a.hp : ""
    Log(Format("{} on try {} ({}): {}; boss left at {}; scene change {} s after the tap, encounter {} s after that, lasting {} s{}",
        result, a.try, a.script = "" ? "no script" : a.script, a.reason, hp = "" ? "unread health" : hp "%",
        tapToChange, changeToShown, shownFor, saved != "" ? "; video " saved : "; no video"))
    AppendCsv(Cfg["RunsFile"], "time," Boss.Ids.Header ",try,script,result,reason,boss_hp_pct,tap_to_change_s,change_to_encounter_s,encounter_s,video",
        Format("{},{},{},{},{},{},{},{},{},{},{}`n", FormatTime(, "yyyy-MM-dd HH:mm:ss"), Boss.Ids.Of.Call(a.num),
            a.try, a.script, result, a.reason, hp, tapToChange, changeToShown, shownFor, saved))
    if (result = "pass") {
        Passes += 1
        Tries.Delete(a.num)
    } else {
        Fails += 1
        NoteLowest(a.num, hp)
    }
}

/**
 * Fills Lowest from RunsFile: each stage's lowest boss health over its lost tries, by NoteLowest.
 * A file that can't be read, or whose header lacks the result, the health or the stage's columns,
 * leaves Lowest empty.
 */
LoadLowest() {
    global Lowest
    Lowest := Map()
    try text := FileRead(A_ScriptDir "\" Cfg["RunsFile"], "UTF-8")
    catch
        return
    names := []
    for i, line in StrSplit(text, "`n", "`r") {
        f := StrSplit(line, ",")
        if (i = 1) {
            names := f
            for need in ["result", "boss_hp_pct", StrSplit(Boss.Ids.Header, ",")*]
                if !HasValue(names, need)
                    return
            continue
        }
        if (f.Length < names.Length)
            continue
        row := Map()
        for j, name in names
            row[name] := f[j]
        if (row["result"] = "fail")
            NoteLowest(Boss.Ids.NumOfRow.Call(row), row["boss_hp_pct"])
    }
}

/**
 * Tells whether an array holds a value.
 * @param arr the array
 * @param value the value
 * @returns true when some element equals it
 */
HasValue(arr, value) {
    for v in arr
        if (v = value)
            return true
    return false
}

/**
 * Keeps a lost try's boss health in Lowest when it is the stage's lowest. 0 is skipped: on a loss
 * the bar drains on the defeat screen, so 0 is a misread.
 * @param num the stage's number, e.g. "rift-6"
 * @param hp the boss's health in percent; empty when unread
 */
NoteLowest(num, hp) {
    if (IsInteger(hp) && hp > 0 && hp < Lowest.Get(num, 101))
        Lowest[num] := Integer(hp)
}

/**
 * Names a try's video.
 * @param num the stage's number, e.g. "358-20"
 * @param attempt the try's number on that stage
 * @returns the file's name, e.g. "358-20_2_2026-10-11_093012.mp4"
 */
VideoName(num, attempt) {
    return num "_" attempt "_" FormatTime(, "yyyy-MM-dd_HHmmss") ".mp4"
}

/**
 * Stops the boss recording and copies it off the device into VideoDir.
 * @param name the file's name, from VideoName
 * @returns the saved path relative to the script; empty when the recording wouldn't stop or the
 *   copy failed
 */
SaveVideo(name) {
    try DirCreate(A_ScriptDir "\" Cfg["VideoDir"])
    if !StopRecording()
        return ""
    rel := Cfg["VideoDir"] "\" name
    return PullFile("/sdcard/stage-boss.mp4", A_ScriptDir "\" rel) ? rel : ""
}

/**
 * The probe's text: the screen the loop would classify, the stage's number as read, and the
 * colour at every signature pixel.
 * @param buf capture from Capture()
 * @returns the tooltip text
 */
ProbeText(buf) {
    return "screen: " ScreenOf(buf) (OvenFull(buf) ? " | oven full" : "") "`nHUD: " HudLine(HudRun(Boss.Hud, buf))
        . "`nSummon:" Describe(buf, Cfg["Summon"]) "`nBoss:" Describe(buf, Cfg["Boss"])
}
