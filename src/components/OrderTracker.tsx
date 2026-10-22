import { STATUS_LABEL, SUPPORT_PHONE_TEL, type Status } from "@/lib/data";

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

/*
 * Motion timeline (ms). The browser plays it from precomputed delays (CSS animations in globals.css), so
 * there are no re-render steps and the stages overlap into one continuous move.
 * Completed steps play as one continuous rail: the brand fill flows down from Ordered with segments chained
 * back-to-back (ease-in → steady → ease-out), and each node pops straight into its check as the fill reaches
 * it (no logo, no pauses). The current step is the only one that gets the Thrive logo: the last line slows
 * into it, then the logo grows in and pulses. Delivered has no current step, so it's the rail alone (~1.1s).
 * Layout never changes during the animation: rows are laid out for the final status from the start.
 */
const START = 380; // begin as the status card settles from its entrance (.screen-enter)
const ARRIVE = 450; // current step's logo grow-in
const CHECK = 340; // dot → check pop
const LINE_LEAD = 60; // first line starts just after Ordered's check pop begins
const RAIL_SEGMENT = 220; // line between completed steps
const LINE_INTO_CURRENT = 420; // last line, decelerating into the current step
const OVERLAP = 0.3; // the current logo starts this fraction of the line before it lands
const RAIL_EASE = { first: "cubic-bezier(0.4, 0, 1, 1)", middle: "linear", last: "cubic-bezier(0, 0, 0.2, 1)" };

type Schedule = {
  arrive: number[];
  arriveDur: number[];
  line: number[];
  lineDur: number[];
  lineEase: string[];
};

function schedule(target: number, delivered: boolean): Schedule {
  const segments = delivered ? STEPS.length - 1 : target;
  const arrive = [START];
  const line: number[] = [];
  const lineDur: number[] = [];
  const lineEase: string[] = [];
  for (let k = 1; k <= segments; k++) {
    const intoCurrent = !delivered && k === segments;
    // With a single line (Preparing to ship) there's no rail to slow down from, so it keeps the rail pace.
    const dur = intoCurrent && segments > 1 ? LINE_INTO_CURRENT : RAIL_SEGMENT;
    line[k - 1] = k === 1 ? START + LINE_LEAD : arrive[k - 1];
    lineDur[k - 1] = dur;
    lineEase[k - 1] = k === segments ? RAIL_EASE.last : k === 1 ? RAIL_EASE.first : RAIL_EASE.middle;
    arrive[k] = line[k - 1] + (intoCurrent ? Math.round(dur * (1 - OVERLAP)) : dur);
  }
  const arriveDur = arrive.map((_, i) => (!delivered && i === target ? ARRIVE : CHECK));
  return { arrive, arriveDur, line, lineDur, lineEase };
}

const delay = (ms: number | undefined) => ({ animationDelay: `${ms ?? 0}ms` });
const timed = (at: number | undefined, dur: number, easing?: string): React.CSSProperties => ({
  animationDelay: `${at ?? 0}ms`,
  animationDuration: `${dur}ms`,
  ...(easing ? { animationTimingFunction: easing } : {}),
});

type FinalState = "done" | "current" | "upcoming";

/**
 * 24px trackerSymbol slot for a step the animation reaches. Completed: grey dot → check, popping as the line
 * reaches the node. Current: grey dot → Thrive logo growing in, then pulsing.
 */
function AnimatedSymbol({ done, arrive, arriveDur }: { done: boolean; arrive: number; arriveDur: number }) {
  return (
    <span aria-hidden className="relative block size-24 shrink-0">
      {/* Not reached yet: the upcoming dot, in the same slot so nothing moves when the step lights up. */}
      <span className="tracker-dot absolute inset-0 flex items-center justify-center" style={delay(arrive)}>
        <img src="/figma/tracker-upcoming.svg" alt="" width={10} height={10} />
      </span>
      {done ? (
        <img src="/figma/tracker-done.svg" alt="" width={24} height={24} className="tracker-check-pop absolute inset-0" style={timed(arrive, arriveDur)} />
      ) : (
        // Halo pulse behind the Thrive logo (like the reference GIF); it sits inside the grow-in, so it stays
        // at scale 0 until the step arrives.
        <span className="tracker-arrive absolute inset-0" style={timed(arrive, arriveDur)}>
          <span className="tracker-halo absolute inset-0 rounded-full bg-illo-brand-mid-weak" style={delay(arrive)} />
          <img src="/figma/tracker-current.svg" alt="" width={24} height={24} className="absolute inset-0" />
        </span>
      )}
    </span>
  );
}

// changeAddressButton (secondary, small).
const ADDRESS_ACTION =
  "type-tiny-bold block w-full rounded-12 border border-stroke-brand-strong px-12 py-[6px] text-center text-text-brand hover:bg-fill-weaker web:max-w-[290px]";

type Props = {
  status: Status;
  /**
   * Ordered step only: shows "Shipping to" and the address, with a Change address button when the address
   * can be changed online (Phase 2) or a Call Thrive button when it can't (Phase 1).
   */
  showAddress?: boolean;
  addressLines?: string[];
  onChangeAddress?: () => void;
};

export function OrderTracker({ status, showAddress = false, addressLines = [], onChangeAddress }: Props) {
  const target = STEPS.indexOf(status);
  const delivered = status === "delivered";
  const { arrive, arriveDur, line, lineDur, lineEase } = schedule(target, delivered);

  return (
    // Keyed by status so the journey replays from Ordered whenever the status changes.
    <ol key={status} className="px-16 pt-24" aria-label="Order progress">
      {STEPS.map((step, i) => {
        const state: FinalState = delivered || i < target ? "done" : i === target ? "current" : "upcoming";
        const reached = state !== "upcoming";
        const isLast = i === STEPS.length - 1;
        const withAddress = step === "ordered" && status === "ordered" && showAddress;
        const lineDrawn = !isLast && state === "done";
        return (
          // gap 14px and the 48px line are fixed values in the Figma component (not variables).
          <li key={step} className="flex gap-[14px]" aria-current={state === "current" ? "step" : undefined}>
            <span className="sr-only">{state === "done" ? "Completed: " : state === "current" ? "Current step: " : "Upcoming: "}</span>
            <div className="flex w-24 shrink-0 flex-col items-center gap-8 pt-8">
              {reached ? (
                <AnimatedSymbol done={state === "done"} arrive={arrive[i]} arriveDur={arriveDur[i]} />
              ) : (
                <img src="/figma/tracker-upcoming.svg" alt="" width={10} height={10} className="shrink-0" />
              )}
              {!isLast && (
                // Fixed grey track; on completed steps a brand fill draws top-down over it (trim path).
                <div
                  aria-hidden
                  className={`relative w-[2px] overflow-hidden rounded-[1px] bg-icon-disabled ${withAddress ? "min-h-48 flex-1" : "h-48"}`}
                >
                  {lineDrawn && (
                    <div
                      className="tracker-draw absolute inset-0 bg-icon-brand"
                      style={timed(line[i], lineDur[i], lineEase[i])}
                    />
                  )}
                </div>
              )}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col gap-4 ${reached ? "pt-8" : "pt-0"} ${isLast ? "pb-24" : "pb-32"}`}>
              <p
                className={`type-small-bold ${reached ? "tracker-label-on text-text-strong" : "text-text-weaker"}`}
                style={reached ? delay(arrive[i]) : undefined}
              >
                {STATUS_LABEL[step]}
              </p>
              {reached && (
                <p className="type-tiny-regular tracker-copy-in text-text-weaker" style={delay(arrive[i])}>
                  {state === "done" ? DONE_DATES[step] : CURRENT_COPY[step]}
                </p>
              )}
              {withAddress && (
                <div className="flex flex-col gap-16">
                  <div className="flex flex-col gap-4 pt-8">
                    <p className="type-uppercase text-text-weak">Shipping to</p>
                    <div className="type-small-regular text-text-strong">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  {onChangeAddress ? (
                    <button type="button" onClick={onChangeAddress} className={ADDRESS_ACTION}>
                      Change address
                    </button>
                  ) : (
                    <a href={SUPPORT_PHONE_TEL} className={ADDRESS_ACTION}>
                      Call Thrive
                    </a>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
