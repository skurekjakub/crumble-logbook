#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
#Include ..\macro-lib\Hud.ahk
; Guild Conquest retry loop over adb: lobby -> ENTER -> fight -> dismiss the results -> repeat.
; A fight whose score is behind MinScore when the countdown reaches CheckAtS is ended early.
; It reads the screen with `adb exec-out screencap` and taps with `adb shell input`, so the emulator
; window can sit behind other windows. Every knob is in conquest-loop.ini; see README.md.

global Runs := 0

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "127.0.0.1:5557",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("EnterX", "712", "EnterY", "2172", "DismissX", "720", "DismissY", "2470",
                  "GuildNavX", "933", "GuildNavY", "2413", "ConquestX", "267", "ConquestY", "1450",
                  "EndBattleX", "988", "EndBattleY", "2248", "JitterPx", "6"),
    "Detect", Map("Lobby", "1200,1374,00CB8F|100,1494,005667|60,2300,007E91|1100,2290,007E91|1320,2160,00CB8F",
                  "EnterReady", "880,2144,FD9500",
                  "EndConfirm", "880,2230,FD9A0D|1100,2260,FD9500|300,2230,14AEB8|720,2060,005E72",
                  "Result", "",
                  "ResultPoints", "200,300|720,300|1240,300|200,1280|720,1280|1240,1280|200,2300|720,2300|1240,2300",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "2000", "AfterEnterMs", "6000", "MinFightMs", "66000", "MaxFightMs", "100000",
                  "RecoverStepMs", "4000", "LaunchWaitMs", "90000", "ReadFromMs", "0", "GoneMs", "3000",
                  "ConfirmWaitMs", "1500", "AfterEndMs", "4000", "FinalWaitMs", "8000"),
    "Prune", Map("MinScore", "1950000000000", "CheckAtS", "30", "LateS", "3", "Node", "node"),
    "Run", Map("MaxRuns", "0", "StuckLimit", "3", "GreyLimit", "8", "RecoverTries", "8",
               "Activity", "com.devsisters.plugin.OvenUnityPlayerActivity", "LogFile", "conquest-loop.log",
               "RunsFile", "conquest-runs.csv", "CurvesFile", "conquest-curves.csv")
)

MacroInit({Title: "Conquest loop", IniPath: A_ScriptDir "\conquest-loop.ini", Defaults: DEFAULTS,
    Counters: () => "runs " Runs, Tag: () => "run " Runs, Probe: ProbeText, Run: RunLoop, Keys: "  F9 learn"})

F9:: Learn()

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
 * The retry loop, run on its own thread by F8. Checks the screen every PollMs.
 * - In the lobby with ENTER lit, it taps ENTER.
 * - Off the lobby, it taps Dismiss once the learned result screen shows, or, with no result
 *   learned, once MinFightMs have passed since ENTER (the fight's full 60 s plus loading).
 *   Dismiss is the bottom-centre button, which leaves a running fight, so it is never tapped earlier.
 * - ReadFromMs after ENTER, it follows the fight with TrackFight, which records the score curve
 *   and judges the pace; a run behind MinScore is ended with EndRun. Once the fight is over or
 *   ended, Dismiss closes the results without waiting for MinFightMs.
 * - Before the first Dismiss of a run, it reads the final score with ReadFinal and records the
 *   run with RecordRun. A run stopped by F8 or an error mid-fight, or one that reaches the lobby
 *   without results, is recorded without one.
 * - Still off the lobby MaxFightMs after ENTER, it navigates back to the lobby with Recover.
 * @throws Error, caught here, when ENTER is greyed, ENTER keeps leaving the lobby showing, or
 *   Recover can't reach the lobby
 */
RunLoop() {
    global Runs, Phase
    stuck := 0
    grey := 0
    ; Started off the lobby: assume a fight began now, so Dismiss waits as it would after ENTER.
    enteredAt := A_TickCount
    rec := NewRun()
    try {
        while Running {
            buf := Capture()
            screen := ScreenOf(buf)
            if (screen != "lobby")
                rec.fought := true
            if (screen = "lobby") {
                if (N("MaxRuns") > 0 && Runs >= N("MaxRuns")) {
                    Log("MaxRuns reached")
                    break
                }
                ; The lobby shows ENTER greyed for a moment while it returns from the results,
                ; so only a lasting grey means the season is closed.
                if !Shows(buf, Cfg["EnterReady"]) {
                    grey += 1
                    if (grey >= N("GreyLimit"))
                        throw Error("ENTER isn't lit: the season is closed, or press F9 on the live lobby to learn its colour")
                    Phase := "ENTER greyed " grey "/" N("GreyLimit")
                    Wait(N("PollMs"))
                    continue
                }
                grey := 0
                if (stuck >= N("StuckLimit")) {
                    ; A popup over the lobby swallows ENTER; leave and come back to clear it.
                    Recover("still in the lobby after " stuck " ENTER taps", true)
                    stuck := 0
                    continue
                }
                if (rec.fought && !rec.recorded)
                    RecordRun(rec, "no-results", "")
                Phase := "enter"
                Tap("Enter")
                Runs += 1
                enteredAt := A_TickCount
                rec := NewRun()
                Log("entered")
                Wait(N("AfterEnterMs"))
                stuck := ScreenOf(Capture()) = "lobby" ? stuck + 1 : 0
                continue
            }
            since := A_TickCount - enteredAt
            if (since >= N("MaxFightMs")) {
                Recover("no lobby " Round(since / 1000) " s after ENTER")
                enteredAt := A_TickCount
            } else if (!rec.tracked && since >= N("ReadFromMs") && since < N("MinFightMs")) {
                rec.tracked := true
                if (TrackFight(rec, enteredAt + N("MinFightMs")) = "behind") {
                    rec.ended := EndRun()
                    continue
                }
                if rec.over
                    continue
            } else if (screen = "result" || (Cfg["Result"] = "" && (since >= N("MinFightMs") || rec.ended || rec.over))) {
                if !rec.recorded
                    RecordRun(rec, EndOf(rec), ReadFinal())
                Phase := "results"
                Tap("Dismiss")
            } else {
                Phase := "fight " Round(since / 1000) "s"
            }
            Wait(N("PollMs"))
        }
    } catch StopSignal {
        Log("stopped by user")
        if (rec.fought && !rec.recorded)
            RecordRun(rec, "stopped", "")
    } catch Error as e {
        Log("error: " e.Message)
        Log(SaveStopShot())
        if (rec.fought && !rec.recorded)
            RecordRun(rec, "error", "")
        TrayTip(e.Message, "Conquest loop stopped", 3)
    }
}

/**
 * Navigates from wherever the game is back to the Guild Conquest lobby: the bottom bar's Guild
 * button, then the Guild Conquest building in the guild hall. Each try first relaunches the game
 * if it isn't on top, dismisses a learned result screen, and ends with Back to close a popup that
 * may hide the bottom bar.
 * @param reason why the loop is recovering, for the log
 * @param leaveFirst true to step out of the lobby first (Back), for a popup that swallows ENTER
 * @throws Error when RecoverTries tries don't reach the lobby
 */
Recover(reason, leaveFirst := false) {
    global Phase
    Phase := "recover"
    Log("recovering: " reason)
    Log(SaveStopShot())
    if leaveFirst {
        KeyEvent(4)
        Wait(N("RecoverStepMs"))
    }
    loop N("RecoverTries") {
        try_ := A_Index
        if !GameOnTop() {
            Log("the game isn't on top; launching it")
            LaunchGame(Cfg["Activity"])
            Wait(N("LaunchWaitMs"))
        }
        screen := ScreenOf(Capture())
        if (screen = "lobby" && !leaveFirst)
            return Log("back in the lobby")
        if (screen = "result") {
            Tap("Dismiss")
            Wait(N("RecoverStepMs"))
        }
        leaveFirst := false
        for step in ["GuildNav", "Conquest"] {
            Tap(step)
            Wait(N("RecoverStepMs"))
            if (ScreenOf(Capture()) = "lobby")
                return Log("back in the lobby after try " try_)
        }
        KeyEvent(4)
        Wait(N("RecoverStepMs"))
    }
    throw Error("couldn't get back to the Conquest lobby after " N("RecoverTries") " tries")
}

/**
 * Follows the fight, reading the HUD as fast as captures come, and adds each reading with both
 * the countdown and the score to the run's curve.
 *
 * With MinScore set, it also judges the pace: the score at the moment the countdown shows
 * CheckAtS seconds left, interpolated between the last reading above it and the first at or
 * below it, since the score climbs fast enough there that a second's lag would add more than
 * the leniency in MinScore. It sets the run's pace and stops early when the run is behind.
 * @param rec the run's record from NewRun; its curve, pace and over are filled in
 * @param deadline A_TickCount by which to stop, e.g. when the fight must be over
 * @returns "behind" when the score at CheckAtS is below MinScore; "over" when the countdown
 *   reads 0, or neither number has been read for GoneMs after the fight showed (the results
 *   are up), and the run's over is set; "lobby" when the lobby shows; "deadline" otherwise
 * @throws StopSignal when F8 stops the loop
 */
TrackFight(rec, deadline) {
    global Phase
    at := N("CheckAtS")
    judging := N("MinScore") > 0
    before := ""
    seenAt := 0
    hud := {out: ""}
    loop {
        CheckStop()
        if (A_TickCount >= deadline) {
            if judging
                Log("pace: no reading by the deadline; keeping the run. Last read: " HudLine(hud.out))
            return "deadline"
        }
        buf := Capture()
        if (ScreenOf(buf) = "lobby") {
            Log("the lobby showed while following the fight")
            return "lobby"
        }
        hud := ReadHud(buf)
        if (hud.timer = "" && hud.score = "") {
            if (seenAt && A_TickCount - seenAt >= N("GoneMs")) {
                rec.over := true
                return "over"
            }
            UpdateStatus()
            continue
        }
        seenAt := A_TickCount
        if (hud.timer = "")
            continue
        if (hud.score != "")
            rec.curve.Push([hud.timer, hud.score])
        Phase := Format("fight, {:.1f} s left", hud.timer)
        UpdateStatus()
        if (hud.timer = 0) {
            rec.over := true
            return "over"
        }
        if !judging
            continue
        if (hud.timer > at) {
            if (hud.score != "")
                before := hud
            continue
        }
        if (hud.timer < at - N("LateS")) {
            Log(Format("pace: no score read by {:.3f} s left; keeping the run", hud.timer))
            judging := false
            continue
        }
        if (hud.score = "")
            continue
        score := hud.score
        if (before != "")
            score := Round(before.score + (hud.score - before.score) * (before.timer - at) / (before.timer - hud.timer))
        Log(Format("pace: {} at {} s left (read {} at {:.3f} s{}); need {}", Short(score), at, Short(hud.score), hud.timer
            , before != "" ? Format(", {} at {:.3f} s", Short(before.score), before.timer) : "", Short(N("MinScore"))))
        rec.pace := score
        judging := false
        if (score < N("MinScore"))
            return "behind"
    }
}

/**
 * Ends the running fight: the bottom-centre button asks "Are you sure you want to end the
 * battle?", and End Battle goes to the results with the score so far.
 * @returns true when End Battle was tapped; false when the confirmation never showed
 * @throws StopSignal when F8 stops the loop mid-wait
 */
EndRun() {
    global Phase
    Phase := "ending the run"
    loop 2 {
        Tap("Dismiss")
        Wait(N("ConfirmWaitMs"))
        if Shows(Capture(), Cfg["EndConfirm"]) {
            Tap("EndBattle")
            Log("ended the run")
            Wait(N("AfterEndMs"))
            return true
        }
    }
    Log("the end-battle confirmation didn't show; letting the fight run out")
    Log(SaveStopShot())
    return false
}

/**
 * Starts the record of a run, numbered and timed from now.
 * @returns {number, entered, fought, tracked, curve, pace, over, ended, recorded}: the run's
 *   number, when it started, whether its fight showed, whether TrackFight ran, its readings as
 *   [seconds left, score] pairs, its score at CheckAtS (empty when none was read), whether the
 *   fight was seen to end, whether EndRun ended it, and whether RecordRun wrote it
 */
NewRun() {
    return {number: Runs, entered: FormatTime(, "yyyy-MM-dd HH:mm:ss"), fought: false, tracked: false,
        curve: [], pace: "", over: false, ended: false, recorded: false}
}

/**
 * Tells how a run that reached its results ended, for the runs file.
 * @param rec the run's record from NewRun
 * @returns "pruned" when EndRun ended it behind pace; otherwise it played the full fight:
 *   "kept-on-pace" when its score at CheckAtS met MinScore, "kept-end-failed" when it was behind
 *   but the end-battle confirmation never showed, and "kept-unjudged" when no score was read
 *   (the pace check off, a fight already running at start, or the HUD unreadable)
 */
EndOf(rec) {
    if rec.ended
        return "pruned"
    if (rec.pace = "")
        return "kept-unjudged"
    return rec.pace >= N("MinScore") ? "kept-on-pace" : "kept-end-failed"
}

/**
 * Reads the final score off the BATTLE OVER results. The results slide in, so it takes a reading
 * only once two captures in a row agree.
 * @returns the final score; empty when FinalWaitMs pass or the lobby shows first, in which case
 *   it logs the last reading and saves the screen to stops\
 * @throws StopSignal when F8 stops the loop
 */
ReadFinal() {
    global Phase
    Phase := "reading the final score"
    deadline := A_TickCount + N("FinalWaitMs")
    last := ""
    hud := {out: ""}
    while (A_TickCount < deadline) {
        CheckStop()
        UpdateStatus()
        buf := Capture()
        if (ScreenOf(buf) = "lobby")
            break
        hud := ReadHud(buf)
        if (hud.final != "" && hud.final = last)
            return hud.final
        last := hud.final
    }
    Log("final score unreadable. Last read: " HudLine(hud.out))
    Log(SaveStopShot())
    return ""
}

/**
 * Logs a run's outcome and appends it to the CSVs next to the script: a row to RunsFile (time,
 * run, end, pace_score, final_score) and its curve to CurvesFile (time, t_left, score: a row
 * per reading, keyed to the run by time).
 * @param rec the run's record from NewRun; marked recorded
 * @param end how the run ended: an EndOf value, "stopped", "error" or "no-results"
 * @param final the final score; empty when it wasn't read
 */
RecordRun(rec, end, final) {
    rec.recorded := true
    Log(Format("run over: {}; {}; final {}; {} readings", end
        , rec.pace = "" ? "no score read at " N("CheckAtS") " s left" : Short(rec.pace) " at " N("CheckAtS") " s left"
        , final = "" ? "unread" : Short(final), rec.curve.Length))
    AppendCsv(Cfg["RunsFile"], "time,run,end,pace_score,final_score"
        , rec.entered "," rec.number "," end "," rec.pace "," final "`n")
    rows := ""
    for p in rec.curve
        rows .= rec.entered "," Format("{:.3f}", p[1]) "," p[2] "`n"
    if (rows != "")
        AppendCsv(Cfg["CurvesFile"], "time,t_left,score", rows)
}

/**
 * Reads the fight's score and countdown, and the results' final score, from a capture with
 * tools/hud.
 * @param buf capture from Capture()
 * @returns {score, timer, final, out}: the scores as integers and the seconds left as a number,
 *   each empty when it couldn't be read, and the reader's output for the log
 */
ReadHud(buf) {
    out := HudRun("read", buf)
    score := HudField(out, "score")
    timer := HudField(out, "timer")
    final := HudField(out, "final")
    return {score: score = "" ? "" : Integer(score), timer: timer = "" ? "" : Number(timer),
        final: final = "" ? "" : Integer(final), out: out}
}

/**
 * Formats a score the way the game abbreviates it, e.g. 1.776T or 37.14G.
 * @param n the score
 * @returns the abbreviated score
 */
Short(n) {
    for unit in [["T", 1e12], ["G", 1e9], ["M", 1e6], ["K", 1e3]]
        if (n >= unit[2])
            return Format("{:.3f}", n / unit[2]) unit[1]
    return String(n)
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
    m.Add("Forget the result screen", (*) => (IniWrite("", Macro.IniPath, "Detect", "Result"), LoadConfig(), UpdateStatus("result forgotten")))
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
        IniWrite(spec, Macro.IniPath, "Detect", key)
        LoadConfig()
        Log("learned " key ": " spec)
        UpdateStatus("learned " key)
    } catch Error as e {
        TrayTip(e.Message, "Learn failed", 3)
    }
}

/**
 * The probe's text: the screen the loop would classify, what the HUD reader reads, and the
 * colour at every signature pixel.
 * @param buf capture from Capture()
 * @returns the tooltip text
 */
ProbeText(buf) {
    return "screen: " ScreenOf(buf) "`nHUD: " HudLine(HudRun("read", buf))
        . "`nLobby:" Describe(buf, Cfg["Lobby"])
        . "`nEnterReady:" Describe(buf, Cfg["EnterReady"]) "`nResult:" Describe(buf, Cfg["Result"])
}
