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
 * Tablet/desktop help + language, matching enroll.thrivemobile.com: compact text buttons
 * (6/12px padding, radius 12, Tiny weight 620, underlined) with a hover tint.
 */
function WebHelpAndLanguage() {
  const btn = "type-tiny-bold font-strong flex items-center rounded-12 px-12 py-[6px] transition-colors";
  return (
    <div className="flex items-center">
      <a href={SUPPORT_PHONE_TEL} className={`${btn} text-text-brand hover:bg-fill-brand-weak`}>
        <span className="underline">Need help?</span>
      </a>
      <button
        type="button"
        className={`${btn} gap-8 text-text-weak hover:bg-fill-weak hover:text-text-strong`}
        aria-label="Español (not available in prototype)"
      >
        <img src="/figma/globe.svg" alt="" width={20} height={20} />
        <span className="underline">Español</span>
      </button>
    </div>
  );
}

/**
 * Mobile (< web): topAppBar from the Shipping file: back arrow + help/language.
 * Tablet and desktop (web+): webHeaderDesktop from the Enrollment file: wordmark + help/language;
 * there is no back arrow on larger screens.
 */
export function Header({ backHref, onBack }: { backHref?: string; onBack?: () => void }) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-background-base web:hidden">
        <div className="flex h-[56px] w-full items-center gap-16 p-16">
          <div className="flex flex-1 items-center gap-16">
            <BackLink backHref={backHref} onBack={onBack} />
          </div>
          <HelpAndLanguage />
        </div>
      </header>
      {/* Same geometry as enroll.thrivemobile.com: 92px tall, content in a centered container up to 1100px
          with 20px padding, logo and links vertically centered. */}
      <header className="relative z-20 hidden h-[92px] items-center justify-center web:flex">
        <div className="flex w-full max-w-[1100px] items-center justify-between p-20">
          {/* Same 179×40 logo file as the live site. */}
          <Link href="/" className="flex items-center" aria-label="Thrive Mobile home">
            <img src="/figma/logo-thrive-mobile.svg" alt="Thrive Mobile" width={179} height={40} />
          </Link>
          <WebHelpAndLanguage />
        </div>
      </header>
    </>
  );
}

