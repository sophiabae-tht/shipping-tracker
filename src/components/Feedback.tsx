"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/data";

export function CallLink({ children = SUPPORT_PHONE_DISPLAY, bold = false }: { children?: React.ReactNode; bold?: boolean }) {
  return (
    <a href={SUPPORT_PHONE_TEL} className={`whitespace-nowrap text-text-brand underline ${bold ? "font-strong" : ""}`}>
      {children}
    </a>
  );
}

/** questionAndLink: "Having trouble? Call us" */
export function HavingTrouble() {
  return (
    <p className="type-small-regular px-16 pt-24 text-text-weak">
      Having trouble? <CallLink bold>Call us</CallLink>
    </p>
  );
}

/** infoCard (error): "Something went wrong" shown above form fields. */
export function ErrorBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-16 pt-24" role="alert">
      <div className="flex items-start gap-12 rounded-12 border-2 border-stroke-error-strong bg-fill-error-weak p-16">
        <img src="/figma/warning-circle.svg" alt="" width={20} height={20} className="shrink-0" />
        <div className="flex-1">
          <p className="type-tiny-bold text-text-strong">{title}</p>
          <p className="type-tiny-regular text-text-weak">{children}</p>
        </div>
      </div>
    </div>
  );
}

/** infoCard (info) */
export function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="px-16 pt-24">
      <div className="flex items-start gap-12 rounded-12 bg-fill-weaker p-16">
        <div className="flex size-24 shrink-0 items-center justify-center">
          <img src={icon} alt="" width={20} height={20} />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <p className="type-tiny-bold text-text-strong">{title}</p>
          <p className="type-tiny-regular text-text-weak">{children}</p>
        </div>
      </div>
    </div>
  );
}

/** iconContainer (fill/weaker). */
function IconContainer({ icon }: { icon: string }) {
  return (
    <div className="flex items-center rounded-full bg-fill-weaker p-12">
      <img src={icon} alt="" width={24} height={24} />
    </div>
  );
}

/** modal over sheetOverlay (fill/overlayStrong), bottom-aligned. */
export function Modal({
  open,
  icon,
  title,
  children,
  actions,
}: {
  open: boolean;
  icon: string;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end px-16 py-[40px] web:items-center web:justify-center">
      <div className="absolute inset-0 bg-fill-overlay-strong" aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative mx-auto max-h-full w-full max-w-[420px] overflow-y-auto rounded-16 bg-background-raised p-8 outline-none web:w-[424px] web:max-w-none web:p-24"
      >
        <div className="px-16 pt-16">
          <div className="inline-flex">
            <IconContainer icon={icon} />
          </div>
        </div>
        <h2 id="modal-title" className="type-heading4-bold px-16 pt-16 text-text-strong">
          {title}
        </h2>
        {children}
        <div className="flex flex-col gap-16 px-16 pt-16">{actions}</div>
        <div className="h-16" />
      </div>
    </div>
  );
}

/**
 * Toast from the Shipping file (status/aep-address-changed): a fill/strong bar, radius-12, raised shadow,
 * with a check icon, Tiny/Regular inverse text and an underlined Dismiss link.
 * Mobile: along the bottom with 16px insets. From the split breakpoint it sits centered at the top, in the
 * header's empty middle, clear of the cards; narrower tablets don't have that room (it would cover the logo
 * and "Need help?"), so it sits bottom-center.
 */
/** Auto-dismiss after this long (paused while hovered or focused), then fade out over TOAST_EXIT_MS. */
const TOAST_MS = 4000;
const TOAST_EXIT_MS = 200;

export function Toast({ title, onClose }: { title: string; onClose: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const dismiss = useCallback(() => setLeaving(true), []);
  // Keep the latest onClose without restarting the timer when the parent re-renders.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (leaving) {
      const t = setTimeout(() => onCloseRef.current(), TOAST_EXIT_MS);
      return () => clearTimeout(t);
    }
    if (paused) return;
    const t = setTimeout(dismiss, TOAST_MS);
    return () => clearTimeout(t);
  }, [leaving, paused, dismiss]);

  return (
    <div
      className={`toast-up split:toast-down pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center p-16 web:bottom-24 web:px-24 web:py-0 split:top-16 split:bottom-auto ${leaving ? "toast-exit!" : ""}`}
    >
      <div
        role="status"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="pointer-events-auto flex w-full max-w-[420px] items-end justify-between gap-16 rounded-12 bg-fill-strong p-16 shadow-raised"
      >
        <div className="flex min-w-0 flex-1 items-center gap-8">
          <img src="/figma/toast-check.svg" alt="" width={16} height={16} className="shrink-0" />
          <p className="type-tiny-regular min-w-0 flex-1 text-text-inverse-strong">{title}</p>
        </div>
        <button type="button" onClick={dismiss} className="type-tiny-regular shrink-0 text-text-inverse-strong underline">
          Dismiss
        </button>
      </div>
    </div>
  );
}
