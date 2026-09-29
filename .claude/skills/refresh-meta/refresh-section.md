# The refresh section

Each round adds one section to the record's README, above the earlier refresh sections (newest
first), after the last content section and before `## Sources`. Earlier refresh sections stay
as they are. Every changelog row points at the evidence that decided it. The heading's date is
the round date: the records test reads it as a round the record ran.

```markdown
## Refresh YYYY-MM-DD

Window: <last round> to <round date>. Patches in it: <version, date, what it changed for this
mode, each with its evidence pointer>, or "none".

### Changelog

| Change | Recommendation | Evidence |
|---|---|---|
| added | <kind, id and name> | `evidence/rYYYY-MM-DD/…` |
| obsoleted since <date> | <kind, id and name>: <reason>; superseded by <id> | `evidence/rYYYY-MM-DD/…` |
| changed | <kind, id and name>: <what: figures, levels, whys, the deck a zone slot or lineup names> | `evidence/rYYYY-MM-DD/…` |
| un-obsoleted | <kind, id and name>: <why it holds again> | `evidence/rYYYY-MM-DD/…` |
| re-captured | <source id>: <what changed on the page>; rows curated from the earlier text | `evidence/rYYYY-MM-DD/…`, earlier `evidence/…` |

A round that changed nothing says so in one line instead of the table.

### Unconfirmed this round

<The current recommendations no source in the round mentioned, each with the searches that
came back without it; they stay current.>

### Couldn't settle

<What the round couldn't answer, each with what would settle it.>
```
