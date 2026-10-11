#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
#Include ..\macro-lib\Hud.ahk
; Stage boss loop over adb: on Summon Boss, taps it and plays the stage's movement script
; (stages\w<world>\<stage>.txt) from the scene change, so the team walks onto the boss as the
; encounter opens. A lost boss brings Summon Boss back within seconds and the loop tries again; a
; beaten one sends the game back to clearing enemies on the next stage. Every knob is in
; stage-loop.ini; see README.md.

global Passes := 0
global Fails := 0
; The stage being fought or next up, as "358-20": read off the screen when the reader can, carried
; forward from the last result when it can't, and kept in StateFile across restarts. Empty until
; first known.
global StateFile := A_ScriptDir "\stage-loop.state"
global Current := ""
try Current := Trim(FileRead(StateFile, "UTF-8"), " `r`n")
; Tries this session, by stage; the stages whose unreadable number was saved for teaching.
global Tries := Map()
global UnreadSaved := Map()
; The screen the last poll classified, so the log records each change once.
global LastScreen := ""

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "127.0.0.1:5557",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("SummonX", "720", "SummonY", "380", "JitterPx", "6"),
    "Detect", Map("Summon", "600,360,FB3B00|660,360,F93D00|820,360,FB3B00|640,400,FFF647|720,400,FFF647",
                  "Boss", "320,380,FF632D|360,380,FF632D|320,400,FF3617|380,400,FF3617",
                  "Transition", "300,800,271D1D|720,1200,271D1D|1100,1000,271D1D|300,1400,271D1D|1100,600,271D1D",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "1000", "UnreadLimit", "10", "StartWaitMs", "25000", "PassAfterMs", "15000"),
    "Stages", Map("Worlds", "9", "Stages", "30", "ScriptDir", "stages", "WaitForScript", "1"),
    "Record", Map("Video", "1", "Seconds", "45", "BitRate", "4000000", "VideoDir", "recordings"),
    "Run", Map("MaxTries", "0", "LogFile", "stage-loop.log", "RunsFile", "stage-runs.csv"),
    "Hud", Map("Node", "node")
)

MacroInit({Title: "Stage loop", IniPath: A_ScriptDir "\stage-loop.ini", Defaults: DEFAULTS,
    Counters: () => "passes " Passes " | fails " Fails, Tag: () => Current = "" ? "-" : Current " #" Tries.Get(Current, 0),
    Probe: ProbeText, Run: RunLoop, Keys: ""})

/**
 * Classifies a capture.
 * @param buf capture from Capture()
 * @returns "boss" (a boss encounter), "summon" (Summon Boss shows: the stage's bar is full, or its
 *   boss just won), or "other" (the stage's enemies, a banner or a transition)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Boss"])
        return "boss"
    if Shows(buf, Cfg["Summon"])
        return "summon"
    return "other"
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
 * Finds a stage's movement script. Worlds repeat every Worlds chapters, so a stage's script is
 * filed by its world, the chapter modulo Worlds, and its stage.
 * @param num the stage's number, e.g. "358-20"
 * @returns the script's path, e.g. "…\stages\w7\20.txt", whether or not it exists
 */
ScriptPath(num) {
    parts := StrSplit(num, "-")
    return A_ScriptDir "\" Cfg["ScriptDir"] "\w" Mod(Integer(parts[1]), N("Worlds")) "\" parts[2] ".txt"
}

/**
 * Tells which stage follows a beaten one.
 * @param num the stage's number, e.g. "358-30"
 * @returns the next stage's number, e.g. "359-1"
 */
NextStage(num) {
    parts := StrSplit(num, "-")
    stage := Integer(parts[2]) + 1
    return stage > N("Stages") ? Integer(parts[1]) + 1 "-1" : parts[1] "-" stage
}

/**
 * Sets the stage being fought or next up, and keeps it in StateFile for the next run.
 * @param num the stage's number, e.g. "358-21"
 */
Expect(num) {
    global Current
    Current := num
    try FileDelete(StateFile)
    try FileAppend(num, StateFile, "UTF-8-RAW")
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
 * The loop, run on its own thread by F8. Polls the screen every PollMs and logs each screen change.
 * - On Summon Boss, it takes the stage's number from the screen, or carries the expected one
 *   forward when the reader can't read it, then taps Summon Boss and plays the stage's script.
 * - While a try is out, Judge follows its encounter to a result.
 * - A stage without a script whose boss won waits for its script (WaitForScript), so the next
 *   try plays it.
 * @throws Error, caught here, when the stage's number is unknown and stays unreadable for
 *   UnreadLimit polls on Summon Boss, or a stage loses MaxTries times in a row
 */
RunLoop() {
    global Phase, Tries
    pending := ""
    unread := 0
    Log("expecting " (Current = "" ? "an unknown stage" : Current))
    try {
        while Running {
            buf := Capture()
            screen := Observe(buf)
            if (pending != "") {
                verdict := Judge(pending, screen)
                if (verdict = "") {
                    Wait(N("PollMs"))
                    continue
                }
                if (verdict = "dropped") {
                    Log(Format("Summon Boss still up {} s after the tap: the encounter didn't start; summoning again",
                        Secs(pending.started, A_TickCount)))
                    StopRecording()
                    Tries[pending.num] -= 1
                } else {
                    Settle(pending, verdict)
                    if (verdict = "pass") {
                        Expect(NextStage(pending.num))
                        Log("expecting " Current " next")
                    }
                }
                pending := ""
            }
            if (screen != "summon") {
                Phase := screen = "boss" ? "boss" : "clearing"
                Wait(N("PollMs"))
                continue
            }
            out := HudRun("stage", buf)
            read := HudField(out, "stage")
            if (read != "") {
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
                    Wait(N("PollMs"))
                    continue
                }
                Log("going by the expected " Current)
            }
            script := ScriptPath(Current)
            if (Tries.Get(Current, 0) > 0 && !FileExist(script) && N("WaitForScript")) {
                if (Phase != "waiting for a script")
                    Log("waiting for " StrReplace(script, A_ScriptDir "\") " before trying again")
                Phase := "waiting for a script"
                Wait(N("PollMs"))
                continue
            }
            if (N("MaxTries") > 0 && Tries.Get(Current, 0) >= N("MaxTries"))
                throw Error(Current " lost " Tries[Current] " times in a row; tune " StrReplace(script, A_ScriptDir "\"))
            unread := 0
            pending := Attempt(Current, script)
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        Log(SaveStopShot())
        TrayTip(e.Message, "Stage loop stopped", 3)
    }
}

/**
 * Follows a try's encounter, one poll at a time, to a result. It needs no stage number: a lost
 * boss brings Summon Boss back within seconds, while a beaten one sends the game back to clearing
 * enemies, where Summon Boss stays away for minutes.
 * @param a the try from Attempt; its seen and ended ticks are filled in, and its reason on a result
 * @param screen the poll's screen, from Observe
 * @returns "fail" when Summon Boss shows after the encounter; "pass" when it hasn't PassAfterMs
 *   after the encounter ended; "dropped" when Summon Boss is still up StartWaitMs after the tap with
 *   no encounter seen; empty while the result isn't in
 */
Judge(a, screen) {
    now := A_TickCount
    if (screen = "boss") {
        if !a.seen {
            a.seen := now
            Log(Format("encounter showing, {} s after the scene change", Secs(a.changed, now)))
        } else if a.ended {
            Log(Format("encounter showing again after {} s away", Secs(a.ended, now)))
        }
        a.ended := 0
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
 * Fights a stage's boss once: starts the recording, taps Summon Boss, waits for the scene to
 * change, and plays the stage's script from the change.
 * @param num the stage's number, e.g. "358-20"
 * @param script the script's path; a missing script plays nothing
 * @returns the try: {num, try, script, video, started, changed, seen, ended, reason}: the ticks
 *   of the tap and the scene change (0 when it didn't change), and of the encounter showing and
 *   ending (0 until they do), which Judge fills in
 * @throws StopSignal when F8 stops the loop mid-script
 */
Attempt(num, script) {
    global Phase, Tries
    Tries[num] := Tries.Get(num, 0) + 1
    rel := StrReplace(script, A_ScriptDir "\")
    has := FileExist(script) != ""
    Log(Format("try {} on {}: {}", Tries[num], num, has ? "script " rel : "no script at " rel))
    video := N("Video") ? VideoName(num, Tries[num]) : ""
    if (video != "") {
        RecordScreen("/sdcard/stage-boss.mp4", N("Seconds"), "--bit-rate " Cfg["BitRate"])
        ; screenrecord takes a moment to start; without this the first frames of the scene change are lost.
        Sleep 300
        Log("recording, to be saved as " Cfg["VideoDir"] "\" video)
    }
    Phase := "summoning"
    Tap("Summon")
    started := A_TickCount
    changed := SceneChange(started)
    Log(changed ? Format("scene changed {} s after the tap", Secs(started, changed))
        : Format("Summon Boss still up {} s after the tap", Secs(started, A_TickCount)))
    if (has && changed) {
        Phase := "playing " rel
        try {
            PlayScript(script, changed)
        } catch Error as e {
            if (e is StopSignal)
                throw e
            Log("script stopped: " e.Message)
        }
    }
    Phase := "boss"
    return {num: num, try: Tries[num], script: has ? rel : "", video: video, started: started,
        changed: changed, seen: 0, ended: 0, reason: ""}
}

/**
 * Waits for the scene to change for the encounter after the tap on Summon Boss: the solid dark
 * transition screen, or the encounter itself when a capture misses the transition. The change
 * usually comes about 1 s after the tap, but has taken over 11 s. Summon Boss merely leaving the
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
        buf := Capture()
        if (Shows(buf, Cfg["Transition"]) || Shows(buf, Cfg["Boss"]))
            return at
    }
    return 0
}

/**
 * Plays a movement script, logging each step with its time from the scene change. One step per
 * line, `;` starts a comment.
 * - `wait <ms>`: does nothing for that long.
 * - `<keys> <ms>`: holds W, A, S or D, or several joined by +, e.g. `W+D 1200`, for that long.
 * @param path the script's path
 * @param changed A_TickCount of the scene change the script counts from
 * @throws Error naming the line when a step isn't one of those; StopSignal when F8 stops the loop
 */
PlayScript(path, changed) {
    for i, line in StrSplit(FileRead(path, "UTF-8"), "`n", "`r") {
        step := Trim(RegExReplace(line, ";.*$"))
        if (step = "")
            continue
        if !RegExMatch(step, "i)^(wait|[WASD](?:\+[WASD])*)\s+(\d+)$", &m)
            throw Error("line " i " isn't a step: " step)
        CheckStop()
        Log(Format("step at +{} s: {}", Secs(changed, A_TickCount), step))
        if (m[1] = "wait") {
            Wait(Integer(m[2]))
            continue
        }
        keys := []
        for k in StrSplit(StrUpper(m[1]), "+")
            keys.Push("KEYCODE_" k)
        HoldKeys(keys, Integer(m[2]))
    }
    Log(Format("script done at +{} s", Secs(changed, A_TickCount)))
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
    Log(Format("{} on try {} ({}): {}; scene change {} s after the tap, encounter {} s after that, lasting {} s{}",
        result, a.try, a.script = "" ? "no script" : a.script, a.reason, tapToChange, changeToShown, shownFor,
        saved != "" ? "; video " saved : "; no video"))
    parts := StrSplit(a.num, "-")
    AppendCsv(Cfg["RunsFile"], "time,chapter,stage,world,try,script,result,reason,tap_to_change_s,change_to_encounter_s,encounter_s,video",
        Format("{},{},{},{},{},{},{},{},{},{},{},{}`n", FormatTime(, "yyyy-MM-dd HH:mm:ss"), parts[1], parts[2],
            Mod(Integer(parts[1]), N("Worlds")), a.try, a.script, result, a.reason, tapToChange, changeToShown,
            shownFor, saved))
    if (result = "pass") {
        Passes += 1
        Tries.Delete(a.num)
    } else {
        Fails += 1
    }
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
    return "screen: " ScreenOf(buf) "`nHUD: " HudLine(HudRun("stage", buf))
        . "`nSummon:" Describe(buf, Cfg["Summon"]) "`nBoss:" Describe(buf, Cfg["Boss"])
}
