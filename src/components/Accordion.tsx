"use client";

import { useId } from "react";

/** _accordionItem: stroke/weaker top divider, Small/Bold title, CaretDown / CaretUp. */
export function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="border-t border-stroke-weaker">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`flex w-full items-center justify-between gap-16 text-left ${open ? "pt-16 pb-8" : "py-16"}`}
      >
        <span className="type-small-bold flex-1 text-text-strong">{title}</span>
        <img src={open ? "/figma/caret-up.svg" : "/figma/caret-down.svg"} alt="" width={16} height={16} />
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
