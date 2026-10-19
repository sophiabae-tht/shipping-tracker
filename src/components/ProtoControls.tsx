"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MEMBERS, STATUS_LABEL, type Mode } from "@/lib/data";
import { useMode } from "@/lib/nav";

/** Floating panel for reviewers: switch journey mode and jump to any mock member. */
export function ProtoControls() {
  const [open, setOpen] = useState(false);
  const mode = useMode();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setMode = (next: Mode) => {
    const search = new URLSearchParams(params.toString());
    if (next === "full") search.set("mode", "full");
    else search.delete("mode");
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  const withMode = (path: string, extra: Record<string, string> = {}) => {
    const search = new URLSearchParams(extra);
    if (mode === "full") search.set("mode", "full");
    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
  };

  return (
    <div className="fixed right-2 bottom-1 z-50 flex flex-col items-end gap-2 font-sans">
      {open && (
        <div
          id="proto-controls"
          className="shadow-overlay w-64 rounded-2xl border border-stroke-weak bg-bg-raised p-3 text-[13px] leading-5 text-text-strong"
        >
          <p className="t-upper pb-2 text-text-weak">Journey mode</p>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-fill-weaker p-1">
            {(
              [
                ["no-change", "No address change"],
                ["full", "Full"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`rounded-lg px-2 py-1.5 font-semibold ${
                  mode === value ? "bg-bg-raised text-text-brand shadow-sm" : "text-text-weak"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="t-upper pt-3 pb-1 text-text-weak">Jump to status</p>
          <ul className="flex flex-col">
            {MEMBERS.map((m) => (
              <li key={m.key}>
                <Link
                  href={withMode("/status", { m: m.key })}
                  onClick={() => setOpen(false)}
                  className="flex justify-between rounded-lg px-2 py-1 hover:bg-fill-weaker"
                >
                  <span className="font-semibold">{m.lastName}</span>
                  <span className="text-text-weak">
                    {m.aep ? "AEP · " : ""}
                    {STATUS_LABEL[m.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="t-upper pt-3 pb-1 text-text-weak">Screens</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-2">
            <Link href={withMode("/")} onClick={() => setOpen(false)} className="text-text-brand underline">
              Home
            </Link>
            <Link href={withMode("/lookup")} onClick={() => setOpen(false)} className="text-text-brand underline">
              Lookup
            </Link>
            {mode === "full" && (
              <Link href={withMode("/address", { m: "smith" })} onClick={() => setOpen(false)} className="text-text-brand underline">
                Edit address
              </Link>
            )}
          </div>
          <p className="pt-3 text-[12px] leading-4 text-text-weaker">
            Tips: any other details show the not-found error. Type “ERROR” in Address to simulate a save failure.
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="proto-controls"
        aria-label="Prototype controls"
        className="shadow-overlay rounded-full bg-text-strong px-2.5 py-1 text-[11px] leading-4 font-semibold text-text-inverse"
      >
        {open ? "Close" : `Controls · ${mode === "full" ? "Full" : "No change"}`}
      </button>
    </div>
  );
}
