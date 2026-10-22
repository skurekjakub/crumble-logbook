import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$mode/overview")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/$mode/findings", params: { mode: params.mode }, replace: true });
  },
});
