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

/*
 * Motion timeline (ms). The browser plays it from precomputed delays (CSS animations in globals.css), so
 * there are no re-render steps and the stages overlap into one continuous move:
 *   arrive: the step's Thrive logo grows out from its center (ease-out), then pulses while it's current
 *   morph:  the logo pops into the filled check circle
 *   line:   the brand fill draws down the (fixed-length) grey track to the next node
 * Completed steps move quickly; timings ease up toward the current step so the journey builds up to it,
 * and the last line decelerates (ease-out) into the current node.
 * Layout never changes during the animation: rows are laid out for the final status from the start.
 */
const START = 380; // begin as the status card settles from its entrance (.screen-enter)
const ARRIVE = { done: 300, current: 450 }; // logo grow-in
const DWELL = { done: 120, current: 220 }; // pause as "current" before checking off
const LINE = { done: 340, current: 560 }; // line trim-path draw
const CHECK = 340; // logo → check pop
const LINE_LEAD = 60; // line starts just after the check pop begins
const OVERLAP = 0.3; // next logo starts this fraction of the line before it lands

const EASE_LINE = "cubic-bezier(0.65, 0, 0.35, 1)"; // ease-in-out between completed steps
const EASE_LINE_IN = "cubic-bezier(0.16, 1, 0.3, 1)"; // ease-out into the current step

/** 0 at the first step → 1 at the current one, on a gentle curve so the slowdown builds rather than jumps. */
const buildup = (k: number, target: number) => (target === 0 ? 1 : Math.pow(k / target, 1.6));
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

type Schedule = {
  arrive: number[];
  arriveDur: number[];
  morph: number[];
  line: number[];
  lineDur: number[];
  lineEase: string[];
};

/*
 * Delivered: nothing is "current", so the journey plays as one continuous rail instead. The brand fill flows
 * from Ordered to Delivered with segments chained back-to-back (ease-in → steady → ease-out), and each node
 * pops straight into its check as the fill reaches it: no logo, no pauses (~1.1s in total).
 */
const RAIL_SEGMENT = 220;
const RAIL_EASE = { first: "cubic-bezier(0.4, 0, 1, 1)", middle: "linear", last: "cubic-bezier(0, 0, 0.2, 1)" };

function railSchedule(): Schedule {
  const last = STEPS.length - 1;
  const arrive = [START];
  const line: number[] = [];
  const lineDur: number[] = [];
  const lineEase: string[] = [];
  for (let k = 1; k <= last; k++) {
    line[k - 1] = k === 1 ? START + LINE_LEAD : line[k - 2] + RAIL_SEGMENT;
    lineDur[k - 1] = RAIL_SEGMENT;
    lineEase[k - 1] = k === 1 ? RAIL_EASE.first : k === last ? RAIL_EASE.last : RAIL_EASE.middle;
    arrive[k] = line[k - 1] + RAIL_SEGMENT;
  }
  return { arrive, arriveDur: arrive.map(() => CHECK), morph: arrive, line, lineDur, lineEase };
}

function schedule(target: number, delivered: boolean): Schedule {
  if (delivered) return railSchedule();
  const arrive = [START];
  const arriveDur = [lerp(ARRIVE.done, ARRIVE.current, buildup(0, target))];
  const morph: number[] = [];
  const line: number[] = [];
  const lineDur: number[] = [];
  for (let k = 1; k <= target; k++) {
    const t = buildup(k, target);
    morph[k - 1] = arrive[k - 1] + arriveDur[k - 1] + lerp(DWELL.done, DWELL.current, buildup(k - 1, target));
    line[k - 1] = morph[k - 1] + LINE_LEAD;
    lineDur[k - 1] = lerp(LINE.done, LINE.current, t);
    arrive[k] = line[k - 1] + Math.round(lineDur[k - 1] * (1 - OVERLAP));
    arriveDur[k] = lerp(ARRIVE.done, ARRIVE.current, t);
  }
  // The line into the current step decelerates; earlier ones ease in-out.
  const lineEase = line.map((_, k) => (k === target - 1 ? EASE_LINE_IN : EASE_LINE));
  return { arrive, arriveDur, morph, line, lineDur, lineEase };
}

const delay = (ms: number | undefined) => ({ animationDelay: `${ms ?? 0}ms` });
const timed = (at: number | undefined, dur: number, easing?: string): React.CSSProperties => ({
  animationDelay: `${at ?? 0}ms`,
  animationDuration: `${dur}ms`,
  ...(easing ? { animationTimingFunction: easing } : {}),
});

type FinalState = "done" | "current" | "upcoming";

/**
 * 24px trackerSymbol slot for a step the animation reaches: grey dot → Thrive logo (pulsing) → check.
 * `direct` (Delivered rail): grey dot → check, popping as the line reaches the node.
 */
function AnimatedSymbol({
  done,
  direct = false,
  arrive,
  arriveDur,
  morph,
}: {
  done: boolean;
  direct?: boolean;
  arrive: number;
  arriveDur: number;
  morph?: number;
}) {
  if (direct) {
    return (
      <span aria-hidden className="relative block size-24 shrink-0">
        <span className="tracker-dot absolute inset-0 flex items-center justify-center" style={delay(arrive)}>
          <img src="/figma/tracker-upcoming.svg" alt="" width={10} height={10} />
        </span>
        <img src="/figma/tracker-done.svg" alt="" width={24} height={24} className="tracker-check-pop absolute inset-0" style={timed(arrive, CHECK)} />
      </span>
    );
  }
  return (
    <span aria-hidden className="relative block size-24 shrink-0">
      {/* Not reached yet: the upcoming dot, in the same slot so nothing moves when the step lights up. */}
      <span className="tracker-dot absolute inset-0 flex items-center justify-center" style={delay(arrive)}>
        <img src="/figma/tracker-upcoming.svg" alt="" width={10} height={10} />
      </span>
      {/* Current: halo pulse behind the Thrive logo (like the reference GIF). Leaves when the check pops. */}
      <span className={`absolute inset-0 ${done ? "tracker-leave" : ""}`} style={delay(morph)}>
        {/* Halo sits inside the grow-in, so it stays at scale 0 until the step arrives. */}
        <span className="tracker-arrive absolute inset-0" style={timed(arrive, arriveDur)}>
          <span className="tracker-halo absolute inset-0 rounded-full bg-illo-brand-mid-weak" style={delay(arrive)} />
          <img src="/figma/tracker-current.svg" alt="" width={24} height={24} className="absolute inset-0" />
        </span>
      </span>
      {done && (
        <img src="/figma/tracker-done.svg" alt="" width={24} height={24} className="tracker-check-pop absolute inset-0" style={timed(morph, CHECK)} />
      )}
    </span>
  );
}

type Props = {
  status: Status;
  /** Ordered step only: shows "Shipping to", the address and a Change address button. */
  showAddress?: boolean;
  addressLines?: string[];
  onChangeAddress?: () => void;
};

export function OrderTracker({ status, showAddress = false, addressLines = [], onChangeAddress }: Props) {
  const target = STEPS.indexOf(status);
  const delivered = status === "delivered";
  const { arrive, arriveDur, morph, line, lineDur, lineEase } = schedule(target, delivered);

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
                <AnimatedSymbol done={state === "done"} direct={delivered} arrive={arrive[i]} arriveDur={arriveDur[i]} morph={morph[i]} />
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
                // Both lines share one grid cell, so swapping "In progress" for the date never shifts layout.
                <div className="type-tiny-regular grid text-text-weaker">
                  {state === "done" && !delivered && CURRENT_COPY[step] !== DONE_DATES[step] ? (
                    <>
                      <span className="tracker-copy-out col-start-1 row-start-1" style={delay(morph[i])}>
                        <span className="tracker-copy-in block" style={delay(arrive[i])}>
                          {CURRENT_COPY[step]}
                        </span>
                      </span>
                      {/* Date fades in once the status line has faded out (150ms), so they never overlap. */}
                      <span className="tracker-copy-in col-start-1 row-start-1" style={delay((morph[i] ?? 0) + 150)}>
                        {DONE_DATES[step]}
                      </span>
                    </>
                  ) : (
                    <span className="tracker-copy-in col-start-1 row-start-1" style={delay(arrive[i])}>
                      {state === "done" ? DONE_DATES[step] : CURRENT_COPY[step]}
                    </span>
                  )}
                </div>
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
                  <button
                    type="button"
                    onClick={onChangeAddress}
                    className="type-tiny-bold w-full rounded-12 web:max-w-[290px] border border-stroke-brand-strong px-12 py-[6px] text-text-brand hover:bg-fill-weaker"
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
