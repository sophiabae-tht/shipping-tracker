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
    <div className="fixed right-8 bottom-4 z-50 flex flex-col items-end gap-8 font-body">
      {open && (
        <div
          id="proto-controls"
          className="type-tiny-regular w-[256px] rounded-16 border border-stroke-weak bg-background-raised p-12 text-text-strong shadow-overlay"
        >
          <p className="type-uppercase pb-8 text-text-weak">Journey mode</p>
          <div className="grid grid-cols-2 gap-4 rounded-12 bg-fill-weaker p-4">
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
                className={`rounded-12 px-8 py-[6px] font-mid ${
                  mode === value ? "bg-background-raised text-text-brand shadow-raised" : "text-text-weak"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="type-uppercase pt-12 pb-4 text-text-weak">Jump to status</p>
          <ul className="flex flex-col">
            {MEMBERS.map((m) => (
              <li key={m.key}>
                <Link
                  href={withMode("/status", { m: m.key })}
                  onClick={() => setOpen(false)}
                  className="flex justify-between rounded-12 px-8 py-4 hover:bg-fill-weaker"
                >
                  <span className="font-mid">{m.lastName}</span>
                  <span className="text-text-weak">
                    {m.aep ? "AEP · " : ""}
                    {STATUS_LABEL[m.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="type-uppercase pt-12 pb-4 text-text-weak">Screens</p>
          <div className="flex flex-wrap gap-x-12 gap-y-4 px-8">
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
          <p className="pt-12 text-text-weaker">
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
        className="type-uppercase rounded-full bg-fill-brand-strong px-8 py-4 normal-case text-text-inverse-strong shadow-overlay"
      >
        {open ? "Close" : mode === "full" ? "Controls · Full" : "Controls"}
      </button>
    </div>
  );
}
