import { useId } from "react";

/** Props for {@link PowerField}. */
export interface PowerFieldProps {
  /** The field's label. */
  label: string;
  /** The text as typed. */
  value: string;
  /** Called with the new text on every edit. The field keeps no state of its own. */
  onChange: (value: string) => void;
  /** The typed power as read, or null when the text isn't a power. */
  power: number | null;
  /** The read power, printed back so the reader sees how it was understood. */
  shown: string | null;
}

/**
 * A team-power input: the text as typed, and under it either how the power
 * was read or, for text that isn't a power, what to type instead.
 *
 * @param props - the label, the text and its setter, and the power read from it
 * @returns the field
 */
export function PowerField({ label, value, onChange, power, shown }: PowerFieldProps) {
  const id = useId();
  const hint = `${id}-hint`;
  const invalid = value.trim() !== "" && power === null;
  return (
    <div className="power-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder="e.g. 2.2G"
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={hint}
        onChange={(e) => onChange(e.target.value)}
      />
      <span id={hint} className={invalid ? "hint bad" : "hint"}>
        {invalid
          ? "Type a power as the game shows it: 2.2G, 971.8M or 4G 3M 599K."
          : shown
            ? `Read as ${shown}.`
            : "The formation screen's team power."}
      </span>
    </div>
  );
}
