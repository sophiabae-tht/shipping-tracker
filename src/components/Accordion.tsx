"use client";

import { useId } from "react";

/** accordionItem: top divider, 16px semibold title, caret on the right. */
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
        className={`flex w-full items-center justify-between gap-4 text-left ${open ? "pt-4 pb-2" : "py-4"}`}
      >
        <span className="t-small-bold flex-1 text-text-strong">{title}</span>
        <img src={open ? "/figma/caret-up.svg" : "/figma/caret-down.svg"} alt="" width={16} height={16} />
      </button>
      <div id={id} hidden={!open}>
        {children}
      </div>
    </div>
  );
}
