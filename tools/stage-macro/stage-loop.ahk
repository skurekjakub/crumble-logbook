#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
#Include ..\macro-lib\Hud.ahk
#Include ..\macro-lib\BossLoop.ahk
; Stage boss loop over adb: on Summon Boss, reads the stage's number, taps the button and plays the
; stage's movement script (stages\w<world>\<stage>.txt), so the team walks onto the boss as the
; encounter opens. Every knob is in stage-loop.ini; see README.md.

BossLoopInit({Title: "Stage loop", IniPath: A_ScriptDir "\stage-loop.ini", StateFile: A_ScriptDir "\stage-loop.state",
    Defaults: Map(
        "Points", Map("SummonX", "720", "SummonY", "380"),
        "Detect", Map("Summon", "600,360,FB3B00|660,360,F93D00|820,360,FB3B00|680,350,FD001C|750,350,FD011C|720,400,FFF647"),
        "Stages", Map("Worlds", "9", "Stages", "30"),
        "Run", Map("LogFile", "stage-loop.log", "RunsFile", "stage-runs.csv")),
    Hud: "stage", NumOf: (read) => read, ScriptPath: ScriptPath, NextStage: NextStage,
    Ids: {Header: "chapter,stage,world", Of: StageIds, NumOfRow: (row) => row["chapter"] "-" row["stage"]}})

/**
 * Tells which world a stage belongs to: worlds repeat every Worlds chapters, so it is the chapter
 * modulo Worlds.
 * @param num the stage's number, e.g. "358-20"
 * @returns the world, e.g. 7
 */
World(num) {
    return Mod(Integer(StrSplit(num, "-")[1]), N("Worlds"))
}

/**
 * Finds a stage's movement script, filed by its world and its stage.
 * @param num the stage's number, e.g. "358-20"
 * @returns the script's path, e.g. "…\stages\w7\20.txt", whether or not it exists
 */
ScriptPath(num) {
    return A_ScriptDir "\" Cfg["ScriptDir"] "\w" World(num) "\" StrSplit(num, "-")[2] ".txt"
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
 * The runs file's columns naming a stage.
 * @param num the stage's number, e.g. "358-20"
 * @returns its chapter, stage and world, comma-separated, e.g. "358,20,7"
 */
StageIds(num) {
    parts := StrSplit(num, "-")
    return parts[1] "," parts[2] "," World(num)
}
