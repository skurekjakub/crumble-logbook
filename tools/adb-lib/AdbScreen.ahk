; Screen reading and tapping over adb, shared by the macros under tools/.
; Every function reads the caller's global Cfg map: Path, Serial, Package, CaptureDisplay,
; InputDisplay (the [Adb] section) and Tolerance.

; The game's displays as last resolved for "auto": Map("Input", logical id, "Capture", SurfaceFlinger id).
global AdbDisplays := Map()

/**
 * Runs adb against the configured device, hidden, and waits for it.
 * @param args everything after `adb -s <serial>`, e.g. "shell input -d 2 tap 100 200"
 * @returns adb's exit code
 */
Adb(args) {
    return RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " " args '"', , "Hide")
}

/**
 * Runs adb against the configured device, hidden, and returns what it printed.
 * @param args everything after `adb -s <serial>`, e.g. "shell dumpsys display"
 * @returns adb's stdout and stderr; empty when it printed nothing
 */
AdbOut(args) {
    path := A_Temp "\adb-out-" ProcessExist() ".txt"
    try FileDelete(path)
    RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " " args ' > "' path '" 2>&1"', , "Hide")
    try return FileRead(path, "UTF-8")
    return ""
}

/**
 * Finds the display the game runs on and stores its ids in AdbDisplays. MuMu renumbers its
 * displays when it restarts, so fixed ids go stale.
 * - The logical id (for `input -d`) is the display whose top resumed activity is [Adb] Package.
 * - The SurfaceFlinger id (for `screencap -d`) is that display's `local:` unique id.
 * @throws Error when the game isn't the top activity on any display, or the display has no unique id
 */
ResolveDisplays() {
    global AdbDisplays
    pkg := Cfg["Package"]
    logical := ""
    current := ""
    loop parse AdbOut("shell dumpsys activity activities"), "`n", "`r" {
        if RegExMatch(A_LoopField, "^\s*Display #(\d+)", &m)
            current := m[1]
        else if (current != "" && InStr(A_LoopField, "topResumedActivity=") && InStr(A_LoopField, " " pkg "/")) {
            logical := current
            break
        }
    }
    if (logical = "")
        throw Error("the game (" pkg ") isn't open on any display; open it, or set [Adb] CaptureDisplay and InputDisplay")
    if !RegExMatch(AdbOut("shell dumpsys display"), "displayId=" logical ", uniqueId='local:(\d+)'", &u)
        throw Error("display " logical " has no SurfaceFlinger id; set [Adb] CaptureDisplay")
    AdbDisplays := Map("Input", logical, "Capture", u[1])
}

/**
 * Returns the display id to pass to adb for capturing or tapping.
 * @param kind "Capture" (reads [Adb] CaptureDisplay) or "Input" (reads InputDisplay)
 * @returns the configured id; the game's resolved id when the value is "auto"; empty for the
 *   default display
 * @throws Error from ResolveDisplays when "auto" can't find the game
 */
GameDisplay(kind) {
    v := Trim(Cfg[kind "Display"])
    if (v != "auto")
        return v
    if !AdbDisplays.Has(kind)
        ResolveDisplays()
    return AdbDisplays[kind]
}

/**
 * Tells whether a file read from screencap holds a whole raw image. A failed screencap prints
 * an error message instead, whose bytes would otherwise read as an absurd width and height.
 * @param buf the bytes screencap wrote
 * @returns true when the header's size is plausible and the pixels are all there
 */
IsImage(buf) {
    if (buf.Size < 16)
        return false
    w := NumGet(buf, 0, "UInt")
    h := NumGet(buf, 4, "UInt")
    return w > 0 && w <= 10000 && h > 0 && h <= 10000 && buf.Size >= 16 + 4 * w * h
}

/**
 * Captures the game's display as raw RGBA: a 16-byte header (width, height, format, colour
 * space as UInt32) followed by 4 bytes per pixel. A failed capture is retried a few times,
 * resolving an "auto" display again in case the emulator renumbered its displays.
 * @returns Buffer with the capture
 * @throws Error when adb produced no image on any try, or "auto" can't find the game
 */
Capture() {
    global AdbDisplays
    path := A_Temp "\adb-screen-" ProcessExist() ".bin"
    loop 4 {
        id := GameDisplay("Capture")
        display := id != "" ? " -d " id : ""
        try FileDelete(path)
        RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " exec-out screencap" display ' > "' path '""', , "Hide")
        try buf := FileRead(path, "RAW")
        catch
            buf := Buffer(0)
        if IsImage(buf)
            return buf
        AdbDisplays := Map()
        Sleep 1000
    }
    throw Error("screen capture failed; check [Adb] Path, Serial, Package and CaptureDisplay")
}

/**
 * Saves what the game shows right now as a PNG, for working out later why a macro stopped.
 * @param path file to write, e.g. "C:\…\stops\2026-10-09_015215.png"
 * @returns true when a PNG was written; false when adb wrote nothing (never raises)
 */
SaveScreenshot(path) {
    try {
        id := GameDisplay("Capture")
        RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " exec-out screencap -p" (id != "" ? " -d " id : "") ' > "' path '""', , "Hide")
        return FileExist(path) && FileGetSize(path) > 0
    }
    return false
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
 * @throws Error from GameDisplay when "auto" can't find the game
 */
TapAt(x, y, jitter := 0) {
    x := Round(x + (jitter > 0 ? Random(-jitter, jitter) : 0))
    y := Round(y + (jitter > 0 ? Random(-jitter, jitter) : 0))
    id := GameDisplay("Input")
    Adb("shell input" (id != "" ? " -d " id : "") " tap " x " " y)
    return {x: x, y: y}
}
