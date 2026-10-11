; Screen reading and tapping over adb, shared by the macros under tools/, and the pipes it runs
; programs on. Every adb function reads the caller's global Cfg map: Path, Serial, Package,
; CaptureDisplay, InputDisplay (the [Adb] section) and Tolerance.

; The game's displays as last resolved for "auto": Map("Input", logical id, "Capture", SurfaceFlinger id).
global AdbDisplays := Map()

/**
 * Starts a program with no window, its output on a pipe the caller reads with PipeRead.
 * @param cmd the command line, e.g. '"C:\…\adb.exe" -s 127.0.0.1:5557 exec-out screencap'; the
 *   program is an .exe, found on PATH when the line doesn't give its folder
 * @param stdin true to give it a pipe for its input, written with PipeWrite; otherwise its input
 *   is empty
 * @param stderr true to send its stderr down the same pipe as its stdout; false to discard it
 * @returns {process, out, in}: its process handle, the read end of its output and the write end of
 *   its input (0 without stdin), for PipeClose to release
 * @throws OSError when a pipe can't be made or the program can't be started, e.g. its file doesn't
 *   exist
 */
PipeStart(cmd, stdin := false, stderr := true) {
    sa := Buffer(3 * A_PtrSize, 0)
    NumPut("UInt", sa.Size, sa, 0)
    NumPut("Int", 1, sa, 2 * A_PtrSize)
    outRead := 0, outWrite := 0, inRead := 0, inWrite := 0
    ; The pipe holds what the program writes while PipeRead waits between reads; a few MB keeps
    ; screencap from stalling on a full pipe.
    if !DllCall("CreatePipe", "Ptr*", &outRead, "Ptr*", &outWrite, "Ptr", sa, "UInt", 0x400000)
        throw OSError()
    if (stdin && !DllCall("CreatePipe", "Ptr*", &inRead, "Ptr*", &inWrite, "Ptr", sa, "UInt", 0)) {
        err := OSError()
        DllCall("CloseHandle", "Ptr", outRead), DllCall("CloseHandle", "Ptr", outWrite)
        throw err
    }
    ; Only the program's ends are inherited: a copy of ours in the program would keep its pipes
    ; open after it exits.
    DllCall("SetHandleInformation", "Ptr", outRead, "UInt", 1, "UInt", 0)
    if inWrite
        DllCall("SetHandleInformation", "Ptr", inWrite, "UInt", 1, "UInt", 0)
    ; NUL for the input and stderr it doesn't get a pipe for, as `< NUL 2> NUL` would give it.
    nul := DllCall("CreateFileW", "Str", "NUL", "UInt", 0xC0000000, "UInt", 3, "Ptr", sa, "UInt", 3
        , "UInt", 0, "Ptr", 0, "Ptr")
    if (nul = -1)
        nul := 0
    si := Buffer(A_PtrSize = 8 ? 104 : 68, 0)
    NumPut("UInt", si.Size, si, 0)
    NumPut("UInt", 0x100, si, A_PtrSize = 8 ? 60 : 44)  ; STARTF_USESTDHANDLES
    NumPut("Ptr", stdin ? inRead : nul, "Ptr", outWrite, "Ptr", stderr ? outWrite : nul, si
        , A_PtrSize = 8 ? 80 : 56)
    pi := Buffer(2 * A_PtrSize + 8, 0)
    ; CreateProcessW may write to the command line, so it gets a copy.
    line := Buffer(StrPut(cmd, "UTF-16"))
    StrPut(cmd, line, "UTF-16")
    ok := DllCall("CreateProcessW", "Ptr", 0, "Ptr", line, "Ptr", 0, "Ptr", 0, "Int", true
        , "UInt", 0x08000000, "Ptr", 0, "Ptr", 0, "Ptr", si, "Ptr", pi)  ; CREATE_NO_WINDOW
    code := A_LastError
    for h in [outWrite, inRead, nul]
        if h
            DllCall("CloseHandle", "Ptr", h)
    if !ok {
        DllCall("CloseHandle", "Ptr", outRead)
        if inWrite
            DllCall("CloseHandle", "Ptr", inWrite)
        throw OSError(code, , cmd)
    }
    DllCall("CloseHandle", "Ptr", NumGet(pi, A_PtrSize, "Ptr"))
    return {process: NumGet(pi, 0, "Ptr"), out: outRead, in: inWrite}
}

/**
 * Appends what a PipeStart program has written since the last read to a buffer, waiting for it to
 * write more when it hasn't yet.
 * @param p the program, from PipeStart
 * @param buf the Buffer to append to; it grows as needed, so its address may change
 * @param size how many bytes of buf are already used
 * @param block true to wait in ReadFile, for a program that starts none of its own: a program
 *   that does, as adb starts its server, can leave a copy of the pipe open after it exits, so the
 *   default waits on the program itself instead
 * @returns how many bytes of buf are used now; size unchanged once the program has exited and
 *   everything it wrote has been read
 */
PipeRead(p, buf, size, block := false) {
    avail := 0
    loop {
        if !DllCall("PeekNamedPipe", "Ptr", p.out, "Ptr", 0, "UInt", 0, "Ptr", 0, "UInt*", &avail, "Ptr", 0)
            return size
        if (avail || block)
            break
        if (DllCall("WaitForSingleObject", "Ptr", p.process, "UInt", 15) != 0x102) {  ; not WAIT_TIMEOUT
            DllCall("PeekNamedPipe", "Ptr", p.out, "Ptr", 0, "UInt", 0, "Ptr", 0, "UInt*", &avail, "Ptr", 0)
            if !avail
                return size
            break
        }
    }
    want := Max(avail, 0x10000)
    if (buf.Size < size + want)
        buf.Size := Max(2 * buf.Size, size + want)
    got := 0
    if !DllCall("ReadFile", "Ptr", p.out, "Ptr", buf.Ptr + size, "UInt", want, "UInt*", &got, "Ptr", 0)
        return size
    return size + got
}

/**
 * Writes a line of text to a PipeStart program's input.
 * @param p the program, from PipeStart with stdin
 * @param text the text, written as UTF-8
 * @returns true when all of it was written; false when the program has closed its input
 */
PipeWrite(p, text) {
    bytes := Buffer(StrPut(text, "UTF-8"))
    n := StrPut(text, bytes, "UTF-8") - 1
    written := 0
    return DllCall("WriteFile", "Ptr", p.in, "Ptr", bytes, "UInt", n, "UInt*", &written, "Ptr", 0) && written = n
}

/**
 * Releases a PipeStart program's handles. A program still reading its input sees it close.
 * @param p the program, from PipeStart
 */
PipeClose(p) {
    for h in [p.process, p.out, p.in]
        if h
            DllCall("CloseHandle", "Ptr", h)
}

/**
 * Runs a program with no window and returns everything it wrote, as bytes.
 * @param cmd the command line, as for PipeStart
 * @param stderr true to include its stderr; false for its stdout alone
 * @returns a Buffer exactly as long as the output
 * @throws OSError when the program can't be started
 */
RunPiped(cmd, stderr := true) {
    p := PipeStart(cmd, false, stderr)
    buf := Buffer(0x100000)
    size := 0
    while ((more := PipeRead(p, buf, size)) != size)
        size := more
    PipeClose(p)
    buf.Size := size
    return buf
}

/**
 * Runs a command line, hidden, and returns what it printed.
 * @param cmd the command line, as for PipeStart, e.g. '"C:\…\adb.exe" -s 127.0.0.1:5557 get-state'
 * @returns stdout and stderr; why it couldn't run when the program can't be started; empty when
 *   it printed nothing
 */
RunOut(cmd) {
    try
        out := RunPiped(cmd)
    catch OSError as e
        return "can't run " cmd ": " e.Message
    return out.Size ? StrGet(out, out.Size, "UTF-8") : ""
}

/**
 * Runs adb against the configured device, hidden, and waits for it.
 * @param args everything after `adb -s <serial>`, e.g. "shell input -d 2 tap 100 200"
 * @returns adb's exit code
 */
Adb(args) {
    return RunWait(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " " args '"', , "Hide")
}

/**
 * Starts adb against the configured device, hidden, without waiting for it.
 * @param args everything after `adb -s <serial>`, e.g. "shell screenrecord /sdcard/x.mp4"
 * @returns the process id
 */
AdbStart(args) {
    Run(A_ComSpec ' /c ""' Cfg["Path"] '" -s ' Cfg["Serial"] " " args '"', , "Hide", &pid)
    return pid
}

/**
 * Runs adb, hidden, and returns what it printed.
 * @param args everything after `adb -s <serial>`, e.g. "shell dumpsys display"; with onDevice
 *   false, everything after `adb`, e.g. "connect 127.0.0.1:5557"
 * @param onDevice false for a command to the adb server rather than the device (no `-s`)
 * @returns adb's stdout and stderr; empty when it printed nothing
 */
AdbOut(args, onDevice := true) {
    return RunOut('"' Cfg["Path"] '"' (onDevice ? " -s " Cfg["Serial"] : "") " " args)
}

/**
 * Makes sure adb reaches the configured device. The adb server drops an emulator that restarts
 * and never finds it again, so a network serial (host:port) that doesn't answer is disconnected
 * and connected again.
 * @throws Error when adb can't reach the device: the emulator isn't running, or the serial is an
 *   `emulator-N` one, which only an adb server restart finds again
 */
EnsureDevice() {
    serial := Cfg["Serial"]
    if (Trim(AdbOut("get-state"), " `r`n") = "device")
        return
    if !RegExMatch(serial, "^[^:\s]+:\d+$")
        throw Error("adb can't reach " serial "; set [Adb] Serial to the emulator's host:port (MuMu: 127.0.0.1:5557), or restart adb with ``adb kill-server``")
    AdbOut("disconnect " serial, false)
    said := Trim(AdbOut("connect " serial, false), " `r`n")
    loop 5 {
        if (Trim(AdbOut("get-state"), " `r`n") = "device")
            return
        Sleep 1000
    }
    throw Error("adb can't reach " serial ", so the emulator isn't running or listens elsewhere (adb: " said ")")
}

/**
 * Finds the display the game runs on and stores its ids in AdbDisplays. MuMu renumbers its
 * displays when it restarts, so fixed ids go stale.
 * - The logical id (for `input -d`) is the display whose top resumed activity is [Adb] Package.
 * - The SurfaceFlinger id (for `screencap -d`) is that display's `local:` unique id.
 * @throws Error from EnsureDevice when adb can't reach the device; Error when the game isn't the
 *   top activity on any display, or the display has no unique id
 */
ResolveDisplays() {
    global AdbDisplays
    EnsureDevice()
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
 * Tells whether the game is the top activity on some display, resolving its displays afresh.
 * When it isn't, the displays it last ran on stay known, so LaunchGame can start it there.
 * @returns true when it is; false when it isn't running or another app covers it
 */
GameOnTop() {
    try {
        ResolveDisplays()
        return true
    }
    return false
}

/**
 * Starts the game's activity, on the display it last ran on when that is known.
 * @param activity the activity class, e.g. "com.devsisters.plugin.OvenUnityPlayerActivity"
 */
LaunchGame(activity) {
    display := AdbDisplays.Has("Input") ? " --display " AdbDisplays["Input"] : ""
    Adb("shell am start" display " -n " Cfg["Package"] "/" activity)
}

/**
 * Sends an Android key event to the game's display, e.g. 4 for Back.
 * @param code the key code
 * @throws Error from GameDisplay when "auto" can't find the game
 */
KeyEvent(code) {
    id := GameDisplay("Input")
    Adb("shell input" (id != "" ? " -d " id : "") " keyevent " code)
}

/**
 * Holds keys down together on the game's display, e.g. W and D to walk diagonally, and returns
 * once they are released.
 * @param keys key code names, e.g. ["KEYCODE_W", "KEYCODE_D"]
 * @param ms how long to hold them
 * @throws Error from GameDisplay when "auto" can't find the game
 */
HoldKeys(keys, ms) {
    id := GameDisplay("Input")
    names := ""
    for k in keys
        names .= " " k
    command := keys.Length = 1 ? " keyevent --duration " : " keycombination -t "
    Adb("shell input" (id != "" ? " -d " id : "") command Round(ms) names)
}

/**
 * Starts recording the game's display on the device, without waiting for it.
 * @param devicePath where the device writes the video, e.g. "/sdcard/boss.mp4"
 * @param seconds when the recording stops
 * @param options more screenrecord options, e.g. "--size 720x1280 --bit-rate 4000000"
 * @returns the adb process id
 * @throws Error from GameDisplay when "auto" can't find the game
 */
RecordScreen(devicePath, seconds, options := "") {
    id := GameDisplay("Capture")
    return AdbStart("shell screenrecord" (id != "" ? " --display-id " id : "") " --time-limit " seconds
        (options != "" ? " " options : "") " " devicePath)
}

/**
 * Stops a recording RecordScreen started, the way Ctrl+C would, so screenrecord finishes the file,
 * and waits on the device, up to 5 s, for it to exit. A recording that already ended returns at once.
 * @returns true when no recording is running any more; false when one still is, or adb can't
 *   reach the device
 */
StopRecording() {
    out := AdbOut('shell "pkill -2 screenrecord; i=0; while pidof screenrecord >/dev/null && [ $i -lt 50 ]; '
        . 'do sleep 0.1; i=$((i+1)); done; pidof screenrecord >/dev/null || echo stopped"')
    return InStr(out, "stopped") > 0
}

/**
 * Copies a file off the device and deletes it there, whether or not the copy arrived.
 * @param devicePath the file on the device, e.g. "/sdcard/boss.mp4"
 * @param localPath where to save it
 * @returns true when the file arrived; false when the device has no such file or it couldn't be saved
 */
PullFile(devicePath, localPath) {
    try {
        data := RunPiped('"' Cfg["Path"] '" -s ' Cfg["Serial"] ' exec-out "cat ' devicePath ' 2>/dev/null; rm -f '
            . devicePath '"', false)
        if !data.Size
            return false
        f := FileOpen(localPath, "w")
        f.RawWrite(data)
        f.Close()
        return true
    }
    return false
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
 * Tells whether screencap's output holds a whole raw image. A failed screencap prints
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
 * reconnecting the device and resolving an "auto" display again in case the emulator restarted
 * or renumbered its displays.
 * @returns Buffer with the capture
 * @throws Error when adb produced no image on any try, adb can't reach the device, or "auto"
 *   can't find the game
 */
Capture() {
    global AdbDisplays
    loop 4 {
        id := GameDisplay("Capture")
        try
            buf := RunPiped('"' Cfg["Path"] '" -s ' Cfg["Serial"] " exec-out screencap" (id != "" ? " -d " id : ""), false)
        catch OSError
            buf := Buffer(0)
        if IsImage(buf)
            return buf
        AdbDisplays := Map()
        EnsureDevice()
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
        png := RunPiped('"' Cfg["Path"] '" -s ' Cfg["Serial"] " exec-out screencap -p" (id != "" ? " -d " id : ""), false)
        if !png.Size
            return false
        f := FileOpen(path, "w")
        f.RawWrite(png)
        f.Close()
        return true
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
