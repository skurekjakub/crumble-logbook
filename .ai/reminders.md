# Periodic rule reminders

The `remind-rules` hook (`.claude/hooks/remind-rules`) re-injects every `- ` bullet below into
each agent's session at most every few minutes, so the rules survive long autonomous turns. Keep
it to three to five one-line rules, ordered by impact; the full rules are in `AGENTS.md`.
Everything that is not a bullet (like this paragraph) is ignored.

- NO COUNTING OR ENUMERATING IN PROSE — never write how many of something the repo has ("three doors", "the same four stages") or type a roster into a sentence. Point at the folder or file that holds the list. Thresholds in a rule and dated measurements in a record are fine. AGENTS.md § Key directives.
- COMMENTS READ AS API, NOT NARRATIVE — JSDoc on every function (what it does, params, returns, how it fails), inline comments only at gotchas, as long as the point needs. Test each sentence: would it still be true if a different caller used this tomorrow? If not, cut it. Why you chose it goes in the commit message; a behaviour that must keep working goes in a test name; history stays in git log.
- FILE CHANGES GO THROUGH Read/Edit/Write — never sed, python heredocs, or cat > through Bash. Bash is for running things.
- UNRELATED CODE — don't touch code outside the task. Surface bad code or design smells you spot; the user decides whether to address separately.
