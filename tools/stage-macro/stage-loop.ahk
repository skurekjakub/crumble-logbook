#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
#Include ..\macro-lib\Hud.ahk
; Stage boss loop over adb: on Summon Boss, reads the stage's number, taps Summon Boss and plays
; the stage's movement script (stages\w<world>\<stage>.txt) from the tap, so the team walks onto
; the boss as the encounter opens. A lost boss shows Summon Boss again on the same stage, and the
; loop tries again; a beaten one moves the stage on. Every knob is in stage-loop.ini; see README.md.

global Passes := 0
global Fails := 0
; The stage being fought, as "358-20", and its tries this session, by stage.
global Current := ""
global Tries := Map()

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "127.0.0.1:5557",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("SummonX", "720", "SummonY", "380", "JitterPx", "6"),
    "Detect", Map("Summon", "600,360,FB3B00|660,360,F93D00|820,360,FB3B00|640,400,FFF647|720,400,FFF647",
                  "Boss", "320,380,FF632D|360,380,FF632D|320,400,FF3617|380,400,FF3617",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "1000", "UnreadLimit", "10", "StartWaitMs", "12000"),
    "Stages", Map("Worlds", "9", "ScriptDir", "stages", "WaitForScript", "1"),
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
 * @returns "summon" (Summon Boss shows: the stage's bar is full, or its boss just won), "boss" (a
 *   boss encounter), or "other" (the stage's enemies, a banner or a transition)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Boss"])
        return "boss"
    if Shows(buf, Cfg["Summon"])
        return "summon"
    return "other"
}

/**
 * Reads the stage's number off a capture.
 * @param buf capture from Capture()
 * @returns the number as "358-20"; empty when it can't be read
 */
ReadStage(buf) {
    return HudField(HudRun("stage", buf), "stage")
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
 * The loop, run on its own thread by F8. Polls the screen every PollMs.
 * - On Summon Boss, it reads the stage's number and settles the attempt it was waiting on, once
 *   that attempt's encounter has shown: the same number means the boss won. Then it taps Summon
 *   Boss and plays the stage's script.
 * - Anywhere else, with an attempt waiting, a stage number other than the attempt's means the
 *   boss fell.
 * - An attempt whose encounter hasn't shown StartWaitMs after the tap, with Summon Boss still up,
 *   didn't start; it is dropped and the stage summoned again.
 * - A stage without a script whose boss won waits for its script (WaitForScript), so the next
 *   try plays it.
 * @throws Error, caught here, when the stage's number stays unreadable for UnreadLimit polls on
 *   Summon Boss, or a stage loses MaxTries times in a row
 */
RunLoop() {
    global Phase, Current, Tries
    pending := ""
    unread := 0
    try {
        while Running {
            buf := Capture()
            screen := ScreenOf(buf)
            if (screen = "boss") {
                if (pending != "")
                    pending.seen := true
                Phase := "boss"
                Wait(N("PollMs"))
                continue
            }
            ; Summon Boss stays up for a moment after the tap, before the scene changes.
            if (pending != "" && !pending.seen) {
                if (screen != "summon" || A_TickCount - pending.started < N("StartWaitMs")) {
                    Wait(N("PollMs"))
                    continue
                }
                Log("the encounter didn't start; summoning again")
                StopRecording()
                Tries[pending.num] -= 1
                pending := ""
            }
            num := (screen = "summon" || pending != "") ? ReadStage(buf) : ""
            if (pending != "" && num != "" && (num != pending.num || screen = "summon")) {
                Settle(pending, num = pending.num ? "fail" : "pass")
                pending := ""
            }
            if (screen != "summon") {
                Phase := "clearing"
                Wait(N("PollMs"))
                continue
            }
            if (num = "") {
                unread += 1
                if (unread >= N("UnreadLimit"))
                    throw Error("can't read the stage's number on Summon Boss; F7 shows what the reader sees")
                Phase := "reading the stage " unread "/" N("UnreadLimit")
                Wait(N("PollMs"))
                continue
            }
            unread := 0
            Current := num
            script := ScriptPath(num)
            if (Tries.Get(num, 0) > 0 && !FileExist(script) && N("WaitForScript")) {
                Phase := "waiting for " StrReplace(script, A_ScriptDir "\")
                Wait(N("PollMs"))
                continue
            }
            if (N("MaxTries") > 0 && Tries.Get(num, 0) >= N("MaxTries"))
                throw Error(num " lost " Tries[num] " times in a row; tune " StrReplace(script, A_ScriptDir "\"))
            pending := Attempt(num, script)
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
 * Fights a stage's boss once: starts the recording, taps Summon Boss, and plays the stage's
 * script from the tap.
 * @param num the stage's number, e.g. "358-20"
 * @param script the script's path; a missing script plays nothing
 * @returns the attempt: {num, try, script, started, video, seen}: seen turns true once the loop
 *   sees the encounter; the video is empty when not recording
 * @throws StopSignal when F8 stops the loop mid-script
 */
Attempt(num, script) {
    global Phase, Tries
    Tries[num] := Tries.Get(num, 0) + 1
    rel := StrReplace(script, A_ScriptDir "\")
    has := FileExist(script) != ""
    video := N("Video") ? VideoName(num, Tries[num]) : ""
    if (video != "") {
        RecordScreen("/sdcard/stage-boss.mp4", N("Seconds"), "--bit-rate " Cfg["BitRate"])
        ; screenrecord takes a moment to start; without this the first frames of the scene change are lost.
        Sleep 300
    }
    Phase := "summoning"
    Tap("Summon")
    started := A_TickCount
    Log("try " Tries[num] ": " (has ? "playing " rel : "no script at " rel))
    if has {
        Phase := "playing " rel
        try {
            PlayScript(script)
        } catch Error as e {
            if (e is StopSignal)
                throw e
            Log("script stopped: " e.Message)
        }
    }
    Phase := "boss"
    return {num: num, try: Tries[num], script: has ? rel : "", started: started, video: video, seen: false}
}

/**
 * Plays a movement script: one step per line, `;` starts a comment.
 * - `wait <ms>`: does nothing for that long.
 * - `<keys> <ms>`: holds W, A, S or D, or several joined by +, e.g. `W+D 1200`, for that long.
 * @param path the script's path
 * @throws Error naming the line when a step isn't one of those; StopSignal when F8 stops the loop
 */
PlayScript(path) {
    for i, line in StrSplit(FileRead(path, "UTF-8"), "`n", "`r") {
        step := Trim(RegExReplace(line, ";.*$"))
        if (step = "")
            continue
        if !RegExMatch(step, "i)^(wait|[WASD](?:\+[WASD])*)\s+(\d+)$", &m)
            throw Error("line " i " isn't a step: " step)
        CheckStop()
        if (m[1] = "wait") {
            Wait(Integer(m[2]))
            continue
        }
        keys := []
        for k in StrSplit(StrUpper(m[1]), "+")
            keys.Push("KEYCODE_" k)
        HoldKeys(keys, Integer(m[2]))
    }
}

/**
 * Logs how an attempt ended, appends it to RunsFile, and saves its video.
 * @param a the attempt from Attempt
 * @param result "pass" or "fail"
 */
Settle(a, result) {
    global Passes, Fails, Tries
    saved := a.video != "" ? SaveVideo(a.video) : ""
    Log(Format("{} on try {}{}{}", result, a.try, a.script = "" ? ", no script" : ", " a.script,
        saved != "" ? "; video " saved : ""))
    parts := StrSplit(a.num, "-")
    AppendCsv(Cfg["RunsFile"], "time,chapter,stage,world,try,script,result,video",
        Format("{},{},{},{},{},{},{},{}`n", FormatTime(, "yyyy-MM-dd HH:mm:ss"), parts[1], parts[2],
            Mod(Integer(parts[1]), N("Worlds")), a.try, a.script, result, saved))
    if (result = "pass") {
        Passes += 1
        Tries.Delete(a.num)
    } else {
        Fails += 1
    }
}

/**
 * Names an attempt's video.
 * @param num the stage's number, e.g. "358-20"
 * @param attempt the attempt's number on that stage
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
