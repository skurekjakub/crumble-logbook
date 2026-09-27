import { createFileRoute } from "@tanstack/react-router";
import { CONQUEST } from "../../app/modes";
import { BossView } from "../../views/BossView";

export const Route = createFileRoute("/conquest/boss")({
  component: () => <BossView mode={CONQUEST} boss={CONQUEST.boss} />,
});
