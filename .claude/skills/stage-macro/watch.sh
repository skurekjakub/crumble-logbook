#!/usr/bin/env bash
# Streams a macro log's decision lines, one per line, for the Monitor tool: `watch.sh [log]
# [pattern]`, the stage loop's log and decision lines by default, or another macro's log and an
# extended regex for its lines. Polls the log's size and reads only the new bytes, so the file is
# never held open: `tail -f` locks it on Windows and the loop then drops lines.
#
# A Monitor's expiry kills only the wrapper shell, never this loop, so the loop ends itself: when
# its parent is gone, when its output has no reader, and when a newer watcher starts.
f="${1:-C:/repositories/crumble-logbook/tools/stage-macro/stage-loop.log}"
stage_lines="pass on|fail on|waiting for|error|stopped|didn't start|where .* was expected|unread|started|oven"
pattern="${2:-$stage_lines}"
pidfile="${TMPDIR:-/tmp}/stage-macro-watch.pid"
if read -r old 2>/dev/null < "$pidfile" && [ "$old" != "$$" ] &&
  grep -q watch.sh "/proc/$old/cmdline" 2>/dev/null; then
  kill "$old" 2>/dev/null
fi
echo $$ > "$pidfile"
parent=$PPID
off=$(stat -c %s "$f")
while kill -0 "$parent" 2>/dev/null; do
  read -r owner 2>/dev/null < "$pidfile" && [ "$owner" != "$$" ] && exit 0
  s=$(stat -c %s "$f" 2>/dev/null || echo "$off")
  if [ "$s" -lt "$off" ]; then off=0; fi
  if [ "$s" -gt "$off" ]; then
    tail -c +$((off + 1)) "$f" | head -c $((s - off)) |
      grep -E "$pattern"
    [ "${PIPESTATUS[2]}" -gt 128 ] && exit 0
    off=$s
  fi
  sleep 2
done
