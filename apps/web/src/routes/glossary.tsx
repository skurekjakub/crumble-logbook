import { createFileRoute } from "@tanstack/react-router";
import { Placeholder } from "../components/Placeholder";

export const Route = createFileRoute("/glossary")({
  component: () => <Placeholder title="Glossary" />,
});
