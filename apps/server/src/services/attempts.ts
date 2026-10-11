import type { Attempts } from "@crumble/schema";
import type { AttemptsRepo } from "../repos/attempts";

/** Read access to the Guild Conquest macro's recorded attempts. */
export interface AttemptsService {
  /**
   * Lists every recorded attempt, oldest first, with its curve and the macro's pace rule.
   *
   * @returns the attempts; `available` false where the macro hasn't recorded any
   */
  list(): Attempts;
}

/**
 * Builds an {@link AttemptsService} over the macro's files.
 *
 * @param repo - reads the macro's runs, curves and INI
 * @returns the service
 */
export function createAttemptsService(repo: AttemptsRepo): AttemptsService {
  return {
    /** @inheritdoc */
    list: () => repo.read(),
  };
}
