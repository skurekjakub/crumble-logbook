import { Fragment } from "react";
import { shortName } from "../lib/cookie-icons";
import { CookieIcon } from "./CookieIcon";

/** Props for {@link AtkOrder}. */
export interface AtkOrderProps {
  /** Cookies from highest ATK to lowest, as the deck's `atkOrder` name refs. */
  order: ReadonlyArray<{ kr: string; en: string | null }>;
}

/**
 * The ATK-order chain ("Milk › Brightseeker › …"): the order that steers
 * Pomegranate's buff, each step with its portrait and short name (the full
 * name in the tooltip). Unresolved names show in Korean.
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
          <span className="step" title={c.en ?? c.kr}>
            <CookieIcon kr={c.kr} en={c.en} size={20} />
            <span>{c.en ? shortName(c.en) : c.kr}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
