import { createFileRoute } from "@tanstack/react-router";
import { FormulaView } from "../views/FormulaView";

export const Route = createFileRoute("/formula")({
  component: FormulaView,
});
