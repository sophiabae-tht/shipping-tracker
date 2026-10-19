"use client";

import { useEffect, useRef } from "react";
import { SUPPORT_PHONE_DISPLAY, SUPPORT_PHONE_TEL } from "@/lib/data";

export function CallLink({ children = SUPPORT_PHONE_DISPLAY, bold = false }: { children?: React.ReactNode; bold?: boolean }) {
  return (
    <a href={SUPPORT_PHONE_TEL} className={`whitespace-nowrap text-text-brand underline ${bold ? "font-semibold" : ""}`}>
      {children}
    </a>
  );
}

/** "Having trouble? Call us" */
export function HavingTrouble() {
  return (
    <p className="t-small px-4 pt-6 text-text-weak">
      Having trouble? <CallLink bold>Call us</CallLink>
    </p>
  );
}

/** Red "Something went wrong" card shown above form fields. */
export function ErrorBanner({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-6" role="alert">
      <div className="flex items-start gap-3 rounded-xl border-2 border-stroke-error bg-[rgba(217,54,54,0.07)] p-4">
        <img src="/figma/warning-circle.svg" alt="" width={20} height={20} className="shrink-0" />
        <div className="flex-1">
          <p className="t-tiny-bold text-text-strong">{title}</p>
          <p className="t-tiny text-text-weak">{children}</p>
        </div>
      </div>
    </div>
  );
}

export function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 pt-6">
      <div className="flex items-start gap-3 rounded-xl bg-fill-weaker p-4">
        <img src={icon} alt="" width={24} height={24} className="shrink-0" />
        <div className="flex flex-1 flex-col gap-1">
          <p className="t-tiny-bold text-text-strong">{title}</p>
          <p className="t-tiny text-text-weak">{children}</p>
        </div>
      </div>
    </div>
  );
}

function IconBubble({ icon, tone = "neutral" }: { icon: string; tone?: "neutral" | "success" }) {
  return (
    <div className={`flex items-center rounded-full p-3 ${tone === "success" ? "bg-fill-success-weak" : "bg-fill-weaker"}`}>
      <img src={icon} alt="" width={24} height={24} />
    </div>
  );
}

/** Bottom-aligned dialog over a dark overlay. */
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
    <div className="fixed inset-0 z-40 mx-auto flex max-w-[420px] flex-col justify-end px-4 py-10">
      <div className="absolute inset-0 bg-fill-overlay" aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="relative max-h-full overflow-y-auto rounded-2xl bg-bg-raised p-2 outline-none"
      >
        <div className="px-4 pt-4">
          <div className="inline-flex">
            <IconBubble icon={icon} />
          </div>
        </div>
        <h2 id="modal-title" className="t-h4 px-4 pt-4 text-text-strong">
          {title}
        </h2>
        {children}
        <div className="flex flex-col gap-4 px-4 pt-4">{actions}</div>
        <div className="h-4" />
      </div>
    </div>
  );
}

/** Success toast pinned to the bottom of the screen; dismissible. */
export function Toast({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[420px] px-4 pb-10">
      <div role="status" className="shadow-overlay pointer-events-auto rounded-2xl bg-bg-raised p-2">
        <div className="flex items-start justify-between px-4 pt-4">
          <IconBubble icon="/figma/check-success.svg" tone="success" />
          <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-2 p-2">
            <img src="/figma/toast-close.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <p className="t-h4 px-4 pt-4 text-text-strong">{title}</p>
        <p className="t-small px-4 pt-2 text-text-weak">{children}</p>
        <div className="h-4" />
      </div>
    </div>
  );
}
