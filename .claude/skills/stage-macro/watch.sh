#!/usr/bin/env bash
# Streams the stage loop's decision lines, one per line, for the Monitor tool. Polls the log's size
# and reads only the new bytes, so the file is never held open: `tail -f` locks it on Windows and
# the loop then drops lines.
f="${1:-C:/repositories/crumble-logbook/tools/stage-macro/stage-loop.log}"
off=$(stat -c %s "$f")
while true; do
  s=$(stat -c %s "$f" 2>/dev/null || echo "$off")
  if [ "$s" -lt "$off" ]; then off=0; fi
  if [ "$s" -gt "$off" ]; then
    tail -c +$((off + 1)) "$f" | head -c $((s - off)) |
      grep -E "pass on|fail on|waiting for|error|stopped|didn't start|where .* was expected|unread|started" || true
    off=$s
  fi
  sleep 2
done
