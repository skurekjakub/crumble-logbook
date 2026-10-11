#Requires AutoHotkey v2.0
#SingleInstance Force
#Include ..\macro-lib\AdbScreen.ahk
#Include ..\macro-lib\Macro.ahk
; EXP Dungeon retry loop over adb: taps ENTER in the dungeon lobby, closes the DEFEAT screen, repeats.
; It reads the screen with `adb exec-out screencap` and taps with `adb shell input`, so the emulator
; window can sit behind other windows. Every knob is in exp-retry.ini; see README.md.

global Entries := 0
global Defeats := 0

; Fallbacks used when a key is missing from the INI. Section -> key -> value.
global DEFAULTS := Map(
    "Adb", Map("Path", "C:\Program Files\Netease\MuMuPlayer\nx_main\adb.exe", "Serial", "emulator-5556",
               "Package", "com.devsisters.cc", "CaptureDisplay", "auto", "InputDisplay", "auto"),
    "Points", Map("EnterX", "716", "EnterY", "2070", "CloseX", "720", "CloseY", "2470", "JitterPx", "6"),
    "Detect", Map("Lobby", "880,2040,FD9500|600,2120,EB8A00|1080,2080,025F72|100,2290,D9E4E7",
                  "Defeat", "120,300,0A364B|880,2040,0D384C|100,2290,093346|720,2450,FFD21C",
                  "Tolerance", "30"),
    "Timing", Map("PollMs", "1500", "AfterEnterMs", "6000", "AfterCloseMs", "2500"),
    "Run", Map("MaxEntries", "0", "LobbyStuckLimit", "3", "LogFile", "exp-retry.log")
)

MacroInit({Title: "EXP retry", IniPath: A_ScriptDir "\exp-retry.ini", Defaults: DEFAULTS,
    Counters: () => "entries " Entries " | defeats " Defeats, Tag: () => "entries " Entries ", defeats " Defeats,
    Probe: ProbeText, Run: RunLoop, Keys: ""})

/**
 * Classifies a capture.
 * @param buf capture from Capture()
 * @returns "defeat", "lobby", or "other" (a fight, a transition or anything unknown)
 */
ScreenOf(buf) {
    if Shows(buf, Cfg["Defeat"])
        return "defeat"
    if Shows(buf, Cfg["Lobby"])
        return "lobby"
    return "other"
}

/**
 * The retry loop, run on its own thread by F8. It never taps on a screen it doesn't
 * recognise, so a fight (or a chain of wins under the game's Auto) just gets polled.
 * @throws Error, caught here, when ENTER keeps leaving the lobby showing (out of keys or a popup)
 */
RunLoop() {
    global Entries, Defeats, Phase
    stuck := 0
    last := ""
    try {
        while Running {
            screen := ScreenOf(Capture())
            if (screen = "defeat") {
                ; The X only answers once DEFEAT's animation ends, so one defeat can take several taps.
                if (last != "defeat") {
                    Defeats += 1
                    Log("defeat")
                }
                last := screen
                Phase := "defeat, closing"
                Tap("Close")
                Wait(N("AfterCloseMs"))
                continue
            }
            last := screen
            if (screen = "lobby") {
                if (N("MaxEntries") > 0 && Entries >= N("MaxEntries")) {
                    Log("MaxEntries reached")
                    break
                }
                if (stuck >= N("LobbyStuckLimit"))
                    throw Error("still in the lobby after " stuck " ENTER taps: out of keys, or a popup is open")
                Phase := "enter"
                Tap("Enter")
                Entries += 1
                Wait(N("AfterEnterMs"))
                stuck := ScreenOf(Capture()) = "lobby" ? stuck + 1 : 0
                continue
            }
            Phase := "fight"
            Wait(N("PollMs"))
        }
    } catch StopSignal {
        Log("stopped by user")
    } catch Error as e {
        Log("error: " e.Message)
        TrayTip(e.Message, "EXP retry stopped", 3)
    }
}

/**
 * The probe's text: the screen the loop would classify and the colour at every signature pixel.
 * @param buf capture from Capture()
 * @returns the tooltip text
 */
ProbeText(buf) {
    return "screen: " ScreenOf(buf) "`nLobby:" Describe(buf, Cfg["Lobby"]) "`nDefeat:" Describe(buf, Cfg["Defeat"])
}
