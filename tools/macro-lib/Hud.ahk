; Reads numbers off a capture with tools/hud, which Node 24+ runs directly. Reads the caller's
; global Cfg map: Node, the command that runs Node.

global HudCli := A_LineFile "\..\..\hud\src\cli.ts"

/**
 * Runs a tools/hud command on a capture.
 * @param command the command, e.g. "read" for the Guild Conquest fields or "stage"
 * @param buf capture from Capture()
 * @returns the reader's output, one "<field> <value>" or "<field> ? <reason>" line per field
 */
HudRun(command, buf) {
    path := TempPath("hud", ".bin")
    f := FileOpen(path, "w")
    f.RawWrite(buf)
    f.Close()
    out := RunOut('"' Cfg["Node"] '" "' HudCli '" ' command ' "' path '"')
    try FileDelete(path)
    return out
}

/**
 * Picks a field's value out of a reader's output.
 * @param out output from HudRun
 * @param field the field's name, e.g. "score"
 * @returns the value as printed, e.g. "1776472632591" or "358-20"; empty when it wasn't read
 */
HudField(out, field) {
    return RegExMatch(out, "m)^" field " ([^?\s]\S*)", &m) ? m[1] : ""
}

/**
 * Flattens a reader's output onto one line, for a log or a tooltip.
 * @param out output from HudRun
 * @returns the lines joined by " | "
 */
HudLine(out) {
    return StrReplace(Trim(out, "`r`n"), "`n", " | ")
}
