"use client";

import { MEMBERS, STATUS_LABEL, type Member, type Mode } from "@/lib/data";

export type SamplePick = { firstName: string; lastName: string; plan: string; memberId: string; dob: string };

type Sample = {
  name: string;
  scenario: string;
  meta: string;
  badge: "Editable" | "Locked" | "No match";
  pick: SamplePick;
};

const SCENARIOS: Record<string, string> = {
  smith: "Happy path. Order placed; in Full mode, change the address (try a ZIP that doesn't match, or 'ERROR' to simulate a failed save).",
  lopez: "AEP enrollee: plan starts Jan 1, 2027, and the phone ships closer to that date. Address editable in Full mode.",
  nguyen: "Preparing to ship: the address can no longer be changed online, so members are asked to call.",
  johnson: "Shipped: shows the USPS carrier, tracking number and expected delivery date.",
  patel: "Out for delivery: arriving today by 5 PM ET.",
  brown: "Delivered on Oct 30, with a prompt to call if the phone didn't arrive.",
};

function fromMember(m: Member, mode: Mode): Sample {
  return {
    name: `${m.firstName} ${m.lastName}`,
    scenario: SCENARIOS[m.key],
    meta: `${m.memberId} · ${m.aep ? "AEP · " : ""}${STATUS_LABEL[m.status]}`,
    badge: mode === "full" && m.status === "ordered" ? "Editable" : "Locked",
    pick: { firstName: m.firstName, lastName: m.lastName, plan: "Humana", memberId: m.memberId, dob: m.dob },
  };
}

const NOT_ON_FILE: Sample = {
  name: "Jane Doe",
  scenario: "Not on file: the details don't match a member, so the lookup shows the “Something went wrong” error.",
  meta: "H99999999 · No match",
  badge: "No match",
  pick: { firstName: "Jane", lastName: "Doe", plan: "Humana", memberId: "H99999999", dob: "04/12/1956" },
};

/** Mock-member picker under the lookup form: prefills the form and continues the flow. */
export function SampleMembers({ mode, onPick }: { mode: Mode; onPick: (pick: SamplePick) => void }) {
  const samples = [...MEMBERS.map((m) => fromMember(m, mode)), NOT_ON_FILE];
  return (
    <section aria-labelledby="sample-members" className="w-full px-16 pt-32 pb-40 web:max-w-[720px] web:px-0 web:pt-0">
      <h2 id="sample-members" className="type-small-bold text-text-strong">
        Sample members
      </h2>
      <p className="type-tiny-regular pt-4 text-text-weak">
        This prototype runs on mock data. Pick a member to prefill the lookup, then continue through the flow.
        {mode === "full" ? "" : " Switch Controls to Full to try changing an address."}
      </p>
      <ul className="grid grid-cols-1 gap-12 pt-16 web:grid-cols-2">
        {samples.map((s) => (
          <li key={s.pick.memberId}>
            <button
              type="button"
              onClick={() => onPick(s.pick)}
              className="flex h-full w-full flex-col gap-8 rounded-16 border border-stroke-weaker bg-background-raised p-16 text-left shadow-raised transition-shadow hover:shadow-overlay focus-visible:outline-2 focus-visible:outline-stroke-brand-strong"
            >
              <span className="flex items-start justify-between gap-8">
                <span className="type-small-bold text-text-strong">{s.name}</span>
                <span
                  className={`type-tiny-bold shrink-0 rounded-full px-8 ${
                    s.badge === "Editable"
                      ? "bg-fill-brand-weaker text-text-brand"
                      : s.badge === "No match"
                        ? "bg-fill-error-weak text-text-error"
                        : "bg-fill-weaker text-text-weak"
                  }`}
                >
                  {s.badge}
                </span>
              </span>
              <span className="type-tiny-regular flex-1 text-text-weak">{s.scenario}</span>
              <span className="flex items-end justify-between gap-8 border-t border-stroke-weaker pt-8">
                <span className="type-tiny-regular text-text-weaker">{s.meta}</span>
                <span className="type-tiny-bold shrink-0 text-text-brand">Prefill →</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
