#!/usr/bin/env bash
# Streams a macro log's decision lines for the Monitor tool like watch.sh, batching losses: every
# other decision line passes through at once, while losses are summarised every N of them with the
# lowest boss health they left. Unread stage numbers are dropped, since the loop carries the stage.
# Usage: watch-batched.sh [log] [N]   (default: the stage loop's log, 30)
log="${1:-C:/repositories/crumble-logbook/tools/stage-macro/stage-loop.log}"
every="${2:-30}"
bash "$(dirname "$0")/watch.sh" "$log" |
  awk -v every="$every" '
    /fail on try/ {
      n++
      if (match($0, /boss left at [0-9]+%/)) {
        hp = substr($0, RSTART + 13, RLENGTH - 14) + 0
        if (hp > 0 && (low == "" || hp < low)) low = hp
      }
      if (n >= every) {
        print n " losses since the last ping, lowest " (low == "" ? "unread" : low "%") "; last: " $0
        fflush(); n = 0; low = ""
      }
      next
    }
    /stage number unread|for teaching the reader/ { next }
    { print; fflush() }
  '
