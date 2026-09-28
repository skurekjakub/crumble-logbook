import { Fragment } from "react";

/** Props for {@link AtkOrder}. */
export interface AtkOrderProps {
  /** Cookies from highest ATK to lowest, as the deck's `atkOrder` name refs. */
  order: ReadonlyArray<{ kr: string; en: string | null }>;
}

/**
 * The ATK-order chain ("Milk › Brightseeker › …"): the order that steers
 * Pomegranate's buff. Unresolved names show in Korean.
 *
 * @param props - the order to show
 * @returns the chain
 */
export function AtkOrder({ order }: AtkOrderProps) {
  return (
    <div className="order">
      {order.map((c, i) => (
        <Fragment key={`${i}-${c.kr}`}>
          {i > 0 && <span className="arr">›</span>}
          <span className="step">{c.en ?? c.kr}</span>
        </Fragment>
      ))}
    </div>
  );
}
