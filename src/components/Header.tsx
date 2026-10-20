"use client";

import Link from "next/link";
import { SUPPORT_PHONE_TEL } from "@/lib/data";

/** topAppBar: back arrow, "Need help?" call link, non-functional language switch. Full-width bar on larger screens. */
export function Header({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  const arrow = <img src="/figma/arrow-left.svg" alt="" width={24} height={24} />;
  return (
    <header className="sticky top-0 z-20 bg-background-base md:border-b md:border-stroke-weaker">
      <div className="mx-auto flex h-[56px] w-full max-w-[1072px] items-center gap-16 p-16">
        <div className="flex flex-1 items-center gap-16">
          {onBack ? (
            <button type="button" onClick={onBack} aria-label="Back" className="-m-8 p-8">
              {arrow}
            </button>
          ) : backHref ? (
            <Link href={backHref} aria-label="Back" className="-m-8 p-8">
              {arrow}
            </Link>
          ) : null}
        </div>
        <div className="flex h-full items-center justify-end gap-16">
          <a href={SUPPORT_PHONE_TEL} className="type-tiny-bold text-text-brand underline">
            Need help?
          </a>
          <button type="button" className="flex items-center gap-8" aria-label="Español (not available in prototype)">
            <img src="/figma/globe.svg" alt="" width={20} height={20} />
            <span className="type-tiny-bold text-text-weak underline">Español</span>
          </button>
        </div>
      </div>
    </header>
  );
}
