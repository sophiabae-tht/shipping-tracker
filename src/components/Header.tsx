"use client";

import Link from "next/link";
import { SUPPORT_PHONE_TEL } from "@/lib/data";

/** topAppBar: back arrow, "Need help?" call link, non-functional language switch. */
export function Header({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  const arrow = <img src="/figma/arrow-left.svg" alt="" width={24} height={24} />;
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 bg-bg-base p-4">
      <div className="flex flex-1 items-center">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back" className="-m-2 p-2">
            {arrow}
          </button>
        ) : backHref ? (
          <Link href={backHref} aria-label="Back" className="-m-2 p-2">
            {arrow}
          </Link>
        ) : null}
      </div>
      <div className="flex h-full items-center justify-end gap-4">
        <a href={SUPPORT_PHONE_TEL} className="t-tiny-bold text-text-brand underline">
          Need help?
        </a>
        <button type="button" className="flex items-center gap-2" aria-label="Español (not available in prototype)">
          <img src="/figma/globe.svg" alt="" width={20} height={20} />
          <span className="t-tiny-bold text-text-weak underline">Español</span>
        </button>
      </div>
    </header>
  );
}
