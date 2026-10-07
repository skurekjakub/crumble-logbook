; Screen reading and tapping over adb, shared by the macros under tools/.
; Every function reads the caller's global Cfg map: Path, Serial, CaptureDisplay, InputDisplay
; (the [Adb] section) and Tolerance.

/**
 * Runs adb against the configured device, hidden, and waits for it.
 * @param args everything after `adb -s <serial>`, e.g. "shell input -d 2 tap 100 200"
 * @returns adb's exit code
 */
Adb(args) {
    return RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " " args '"', , "Hide")
}

/**
 * Captures the game's display as raw RGBA: a 16-byte header (width, height, format, colour
 * space as UInt32) followed by 4 bytes per pixel. A failed capture is retried a few times.
 * @returns Buffer with the capture; throws when adb produced no image on any try
 */
Capture() {
    path := A_Temp "\adb-screen-" ProcessExist() ".bin"
    display := Cfg["CaptureDisplay"] != "" ? " -d " Cfg["CaptureDisplay"] : ""
    loop 4 {
        try FileDelete(path)
        RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " exec-out screencap" display ' > "' path '""', , "Hide")
        try buf := FileRead(path, "RAW")
        catch
            buf := Buffer(0)
        if (buf.Size >= 16 && buf.Size >= 16 + 4 * NumGet(buf, 0, "UInt") * NumGet(buf, 4, "UInt"))
            return buf
        Sleep 1000
    }
    throw Error("screen capture failed; check [Adb] Path, Serial and CaptureDisplay")
}

/**
 * Reads one pixel of a capture.
 * @param buf capture from Capture()
 * @param x column in game pixels
 * @param y row in game pixels
 * @returns 0xRRGGBB
 */
Pixel(buf, x, y) {
    off := 16 + (y * NumGet(buf, 0, "UInt") + x) * 4
    return (NumGet(buf, off, "UChar") << 16) | (NumGet(buf, off + 1, "UChar") << 8) | NumGet(buf, off + 2, "UChar")
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
 * Tells whether a capture shows every pixel of a signature.
 * @param buf capture from Capture()
 * @param spec "x,y,RRGGBB|x,y,RRGGBB|…"
 * @returns true when every listed pixel is within Tolerance of its colour; false for an empty spec
 */
Shows(buf, spec) {
    if (Trim(spec) = "")
        return false
    for part in StrSplit(spec, "|") {
        p := StrSplit(Trim(part), ",")
        if !ColorMatches(Pixel(buf, Integer(p[1]), Integer(p[2])), Integer("0x" p[3]), Number(Cfg["Tolerance"]))
            return false
    }
    return true
}

/**
 * Builds a signature from the colours a capture shows at a list of points.
 * @param buf capture from Capture()
 * @param points "x,y|x,y|…"; any colour after a point is ignored
 * @returns "x,y,RRGGBB|…" for those points
 */
Sample(buf, points) {
    out := []
    for part in StrSplit(points, "|") {
        p := StrSplit(Trim(part), ",")
        out.Push(p[1] "," p[2] "," Format("{:06X}", Pixel(buf, Integer(p[1]), Integer(p[2]))))
    }
    s := ""
    for i, v in out
        s .= (i > 1 ? "|" : "") v
    return s
}

/**
 * Describes each pixel of a signature as seen in a capture, for a probe tooltip.
 * @param buf capture from Capture()
 * @param spec "x,y,RRGGBB|…"
 * @returns one "x,y=SEEN (want WANT)" entry per pixel, space-separated
 */
Describe(buf, spec) {
    s := ""
    if (Trim(spec) = "")
        return "(not set)"
    for part in StrSplit(spec, "|") {
        p := StrSplit(Trim(part), ",")
        s .= Format("  {},{}={:06X} (want {})", p[1], p[2], Pixel(buf, Integer(p[1]), Integer(p[2])), p[3])
    }
    return s
}

/**
 * Taps a point in game pixels on the configured input display.
 * @param x column in game pixels
 * @param y row in game pixels
 * @param jitter random offset of up to this many pixels on each axis; 0 for an exact tap
 * @returns the point tapped, as {x, y}
 */
TapAt(x, y, jitter := 0) {
    x := Round(x + (jitter > 0 ? Random(-jitter, jitter) : 0))
    y := Round(y + (jitter > 0 ? Random(-jitter, jitter) : 0))
    Adb("shell input -d " Cfg["InputDisplay"] " tap " x " " y)
    return {x: x, y: y}
}
