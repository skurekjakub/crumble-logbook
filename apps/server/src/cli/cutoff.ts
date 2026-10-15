/**
 * Prints the Guild Conquest early-cutoff report on the macro's recorded runs in `config.macroDir`
 * (`CRUMBLE_MACRO` overrides it). Run via `pnpm conquest:cutoff`: ends with the chosen rule as
 * the INI's `[Prune] Checkpoints=` line, or says no rule qualifies, and exits 0; exits 1, saying
 * why on stderr, when there is no runs file or the runs can't support a fit.
 */
import { macroDir } from "../config";
import { createAttemptsRepo, runsPath } from "../repos/attempts";
import { reportCutoff } from "../services/cutoff-report";

const { text, exitCode } = reportCutoff(createAttemptsRepo(macroDir).read(), runsPath(macroDir));
(exitCode === 0 ? console.log : console.error)(text);
process.exitCode = exitCode;
