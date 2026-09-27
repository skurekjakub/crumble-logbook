import { Pill } from "./Pill";

/**
 * A claim's confidence as a pill; a low-confidence claim reads "unverified
 * claim".
 */
export function ConfidencePill({ confidence }: { confidence: "high" | "medium" | "low" }) {
  return confidence === "low" ? (
    <Pill kind="low">unverified claim</Pill>
  ) : (
    <Pill kind={confidence} />
  );
}
