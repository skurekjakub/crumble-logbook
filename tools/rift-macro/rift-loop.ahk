#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
#Include ..\macro-lib\Hud.ahk
#Include ..\macro-lib\BossLoop.ahk
; Dimensional rift boss loop over adb: on Summon Dimensional Boss, reads the rift stage's number,
; taps the button and plays the stage's movement script (stages\<stage>.txt). Every knob is in
; rift-loop.ini; see README.md.

BossLoopInit({Title: "Rift loop", IniPath: A_ScriptDir "\rift-loop.ini", StateFile: A_ScriptDir "\rift-loop.state",
    Defaults: Map(
        "Points", Map("SummonX", "718", "SummonY", "625"),
        "Detect", Map("Summon", "620,580,DC44F6|820,580,A242EA|600,610,C026F4|640,665,7D0EEE|700,603,FFF647|718,645,FFF647"),
        "Run", Map("LogFile", "rift-loop.log", "RunsFile", "rift-runs.csv")),
    Hud: "rift", NumOf: (read) => "rift-" read, ScriptPath: RiftScript,
    NextStage: (num) => "rift-" (RiftStage(num) + 1),
    Ids: {Header: "stage", Of: RiftStage, NumOfRow: (row) => "rift-" row["stage"]}})

/**
 * Takes the stage out of a rift stage's number.
 * @param num the stage's number, "rift-12", or just "12"
 * @returns the stage, e.g. 12
 * @throws Error when what's left isn't a number
 */
RiftStage(num) {
    return Integer(RegExReplace(num, "^rift-"))
}

/**
 * Finds a rift stage's movement script.
 * @param num the stage's number, e.g. "rift-12"
 * @returns the script's path, "…\stages\12.txt", whether or not it exists
 */
RiftScript(num) {
    return A_ScriptDir "\" Cfg["ScriptDir"] "\" RiftStage(num) ".txt"
}
