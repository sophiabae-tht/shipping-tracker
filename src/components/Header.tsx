"use client";

import Link from "next/link";
import { SUPPORT_PHONE_TEL } from "@/lib/data";

function BackLink({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  const arrow = <img src="/figma/arrow-left.svg" alt="" width={24} height={24} />;
  if (onBack) {
    return (
      <button type="button" onClick={onBack} aria-label="Back" className="-m-8 p-8">
        {arrow}
      </button>
    );
  }
  if (backHref) {
    return (
      <Link href={backHref} aria-label="Back" className="-m-8 p-8">
        {arrow}
      </Link>
    );
  }
  return null;
}

/** _helpAndLanguagePicker: shared by the mobile topAppBar and the desktop webHeaderDesktop. */
function HelpAndLanguage() {
  return (
    <div className="flex h-full items-center justify-end gap-16">
      <a href={SUPPORT_PHONE_TEL} className="type-tiny-bold text-text-brand underline">
        Need help?
      </a>
      <button type="button" className="flex items-center gap-8" aria-label="Español (not available in prototype)">
        <img src="/figma/globe.svg" alt="" width={20} height={20} />
        <span className="type-tiny-bold text-text-weak underline">Español</span>
      </button>
    </div>
  );
}

/**
 * Mobile (< md): topAppBar from the Shipping file: back arrow + help/language.
 * Tablet and desktop (md+): webHeaderDesktop from the Enrollment file: wordmark + help/language;
 * the back arrow moves into the top of the page card (see PageCard).
 */
export function Header({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-background-base md:hidden">
        <div className="flex h-[56px] w-full items-center gap-16 p-16">
          <div className="flex flex-1 items-center gap-16">
            <BackLink backHref={backHref} onBack={onBack} />
          </div>
          <HelpAndLanguage />
        </div>
      </header>
      <header className="relative z-20 hidden h-[96px] items-center justify-between px-56 pt-8 md:flex">
        <Link href="/" className="flex items-center gap-[15.647px]" aria-label="Thrive Mobile home">
          <span className="pb-[2.235px]">
            <img src="/figma/logo-symbol.svg" alt="" width={35.765} height={35.765} />
          </span>
          <img src="/figma/logo-wordmark.svg" alt="Thrive Mobile" width={127.283} height={15.647} />
        </Link>
        <div className="h-24">
          <HelpAndLanguage />
        </div>
      </header>
    </>
  );
}

export { BackLink };
