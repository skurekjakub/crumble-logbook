; Reads numbers off a capture with tools/hud, which Node 24+ runs directly. Reads the caller's
; global Cfg map: Node, the Node executable. Needs AdbScreen.ahk for its pipes.

global HudCli := A_LineFile "\..\..\hud\src\cli.ts"
; The reader serving this process (`cli.ts serve`, from PipeStart); empty until the first read,
; and again once it has died.
global HudServer := ""
; Where each read's capture is written for the reader: one file per process, rewritten every read.
global HudCapture := A_Temp "\hud-" ProcessExist() ".bin"
OnExit(HudCleanup)

/**
 * Runs a tools/hud command on a capture.
 * @param command the command, e.g. "read" for the Guild Conquest fields or "stage"
 * @param buf capture from Capture()
 * @returns the reader's output, one "<field> <value>" or "<field> ? <reason>" line per field; the
 *   reader's error instead when it can't read the capture or can't run at all
 * @throws Error when the capture can't be written to the temp folder
 */
HudRun(command, buf) {
    prev := A_IsCritical
    ; The probe's timer would otherwise interrupt a read and take its answer.
    Critical
    try {
        f := FileOpen(HudCapture, "w")
        f.RawWrite(buf)
        f.Close()
        out := HudAsk(command " " HudCapture)
        ; A reader that died since the last read answers nothing; a fresh one gets the request again.
        if (HudServer = "")
            out := HudAsk(command " " HudCapture)
        return out
    } finally {
        Critical(prev)
    }
}

/**
 * Sends one request to the reader, starting it when it isn't running.
 * @param request "<command> <capture path>"
 * @returns the reader's answer, each line ending in a newline. When the reader has stopped by the
 *   end, HudServer is empty and the answer is whatever it printed before it stopped, or why it
 *   couldn't start.
 */
HudAsk(request) {
    global HudServer
    if (HudServer = "") {
        try
            HudServer := PipeStart('"' Cfg["Node"] '" "' HudCli '" serve', true)
        catch OSError as e
            return "the reader can't start: " e.Message
    }
    if !PipeWrite(HudServer, request "`n") {
        PipeClose(HudServer)
        HudServer := ""
        return ""
    }
    buf := Buffer(0x1000)
    size := 0
    loop {
        more := PipeRead(HudServer, buf, size, true)
        if (more = size) {
            PipeClose(HudServer)
            HudServer := ""
            return size ? StrGet(buf, size, "UTF-8") : ""
        }
        size := more
        ; The answer ends at a blank line.
        if (size >= 2 && NumGet(buf, size - 2, "UShort") = 0x0A0A)
            return StrGet(buf, size - 1, "UTF-8")
    }
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

/**
 * OnExit: deletes this process's capture file. The reader stops by itself once the script's end
 * of its input closes.
 */
HudCleanup(*) {
    try FileDelete(HudCapture)
}
