import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  /**
   * Sends the root path to the Guild Conquest section, replacing the history entry.
   *
   * @throws the router's redirect to `/conquest`
   */
  beforeLoad: () => {
    throw redirect({ to: "/conquest", replace: true });
  },
});
