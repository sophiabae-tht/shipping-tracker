import { STATUS_LABEL, type Status } from "@/lib/data";

const STEPS: Status[] = ["ordered", "preparingToShip", "shipped", "outForDelivery", "delivered"];

// Subcopy per status, matching the orderTracker component spec.
const DONE_DATES: Record<Status, string> = {
  ordered: "Oct 14",
  preparingToShip: "Oct 24",
  shipped: "Oct 28",
  outForDelivery: "Oct 30",
  delivered: "Oct 30",
};
const CURRENT_COPY: Record<Status, string> = {
  ordered: "Oct 14",
  preparingToShip: "In progress",
  shipped: "On its way with USPS",
  outForDelivery: "Arriving by 5 PM ET",
  delivered: "Oct 30",
};

type StepState = "done" | "current" | "upcoming";

function stepState(step: Status, status: Status): StepState {
  const i = STEPS.indexOf(step);
  const current = STEPS.indexOf(status);
  // Delivered is the end of the journey, so every step reads as complete.
  if (status === "delivered" || i < current) return "done";
  return i === current ? "current" : "upcoming";
}

const SYMBOL: Record<StepState, { src: string; size: number; alt: string }> = {
  done: { src: "/figma/tracker-done.svg", size: 24, alt: "Completed" },
  current: { src: "/figma/tracker-current.svg", size: 24, alt: "Current step" },
  upcoming: { src: "/figma/tracker-upcoming.svg", size: 10, alt: "Upcoming" },
};

type Props = {
  status: Status;
  /** Ordered step only: shows "Shipping to", the address and a Change address button. */
  showAddress?: boolean;
  addressLines?: string[];
  onChangeAddress?: () => void;
};

export function OrderTracker({ status, showAddress = false, addressLines = [], onChangeAddress }: Props) {
  return (
    <ol className="px-4 pt-6" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const state = stepState(step, status);
        const isLast = i === STEPS.length - 1;
        const withAddress = step === "ordered" && status === "ordered" && showAddress;
        const symbol = SYMBOL[state];
        const subcopy = state === "done" ? DONE_DATES[step] : state === "current" ? CURRENT_COPY[step] : null;
        return (
          <li key={step} className="flex gap-[14px]" aria-current={state === "current" ? "step" : undefined}>
            <div className="flex w-6 shrink-0 flex-col items-center gap-2 pt-2">
              <img src={symbol.src} alt={symbol.alt} width={symbol.size} height={symbol.size} className="shrink-0" />
              {!isLast && (
                <div
                  aria-hidden
                  className={`w-0.5 rounded-[1px] ${withAddress ? "min-h-12 flex-1" : "h-12"} ${
                    state === "done" ? "bg-brand" : "bg-icon-disabled"
                  }`}
                />
              )}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col gap-1 ${state === "upcoming" ? "pt-0" : "pt-2"} ${isLast ? "pb-6" : "pb-8"}`}>
              <p className={`t-small-bold ${state === "upcoming" ? "text-text-weaker" : "text-text-strong"}`}>
                {STATUS_LABEL[step]}
              </p>
              {subcopy && <p className="t-tiny text-text-weaker">{subcopy}</p>}
              {withAddress && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1 pt-2">
                    <p className="t-upper text-text-weak">Shipping to</p>
                    <div className="t-small text-text-strong">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onChangeAddress}
                    className="t-tiny-bold w-full rounded-xl border border-brand px-3 py-1.5 text-text-brand hover:bg-brand/5"
                  >
                    Change address
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
