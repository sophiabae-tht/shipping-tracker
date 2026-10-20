"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";

/*
 * Date-of-birth picker in the Thrive Mobile design system: Month / Year dropdowns between previous/next
 * arrows, then the day grid (48px cells; today outlined, selected filled, from the Thrive Guide picker) and
 * Clear / Cancel / OK. Every visual is Thrive Mobile: raised white
 * surface, radius-16, overlay shadow, General Sans text styles, the flow's caret icons and its
 * primary/secondary buttons. Opens as a dropdown attached under the field (no overlay), like the address
 * autocomplete; clicking outside or Esc closes it.
 */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MIN_YEAR = 1900;
// Birthdates for this flow cluster around Medicare age, so with no date entered the calendar opens here.
const DEFAULT_VIEW = { year: 1956, month: 0 };

const pad = (n: number) => String(n).padStart(2, "0");
const toValue = (d: Date) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function parse(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
  return d.getMonth() === Number(m[1]) - 1 ? d : null;
}

function startOfToday() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

/** Compact Month / Year dropdown in the flow's style (Small/Bold, radius-12, caret). */
function MiniSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string; disabled?: boolean }[];
  onChange: (v: number) => void;
}) {
  const current = options.find((o) => o.value === value)?.label ?? "";
  return (
    // Hugs the current value like Figma datePickerSelect: an invisible copy of the label sets the width and the
    // select is stretched over it, since a native select is otherwise as wide as its longest option ("September").
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <span aria-hidden className="type-small-bold invisible py-8 pr-32 pl-12 whitespace-pre">
        {current}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="type-small-bold absolute inset-0 w-full cursor-pointer appearance-none rounded-12 bg-transparent py-8 pr-32 pl-12 text-text-strong transition-colors hover:bg-fill-weaker focus-visible:outline-2 focus-visible:outline-stroke-brand-strong"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      <img src="/figma/caret-down.svg" alt="" width={16} height={16} className="pointer-events-none absolute right-12" />
    </label>
  );
}

/** Month arrow (Figma datePickerNav): CaretLeft / CaretRight 16. */
function ArrowButton({ dir, onClick, disabled }: { dir: "prev" | "next"; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "Previous month" : "Next month"}
      className="flex size-48 items-center justify-center disabled:opacity-30"
    >
      <span className="flex size-40 items-center justify-center rounded-full transition-colors hover:bg-fill-weaker">
        <img src={dir === "prev" ? "/figma/caret-left.svg" : "/figma/caret-right.svg"} alt="" width={16} height={16} />
      </span>
    </button>
  );
}

type Props = {
  open: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};

export function DatePicker({ open, value, onSelect, onClose }: Props) {
  if (!open) return null;
  return <Picker value={value} onSelect={onSelect} onClose={onClose} />;
}

function Picker({ value, onSelect, onClose }: Omit<Props, "open">) {
  const today = startOfToday();
  const initial = parse(value);
  const [pending, setPending] = useState<Date | null>(initial);
  const start = initial ?? new Date(DEFAULT_VIEW.year, DEFAULT_VIEW.month, 1);
  const [view, setView] = useState({ year: start.getFullYear(), month: start.getMonth() });
  const [focusDay, setFocusDay] = useState<Date>(initial ?? start);
  const grid = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);

  // Keyboard focus follows the active day; the year list opens scrolled to the year in view.
  useEffect(() => {
    grid.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus();
  }, [focusDay]);
  // Bring the whole dropdown into view (it can open near the bottom of the screen), then focus it.
  // Scroll by the outer anchor: the panel itself is mid-entrance (translated) at this point.
  useEffect(() => {
    anchor.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    dialog.current?.focus({ preventScroll: true });
  }, []);
  // Close on outside click, like the address suggestions. The calendar toggle handles its own clicks.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!dialog.current?.contains(target) && !target.closest("[data-datepicker-toggle]")) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [onClose]);

  const go = (year: number, month: number) => {
    const d = new Date(year, month, 1);
    if (d.getFullYear() < MIN_YEAR || d > today) return;
    setView({ year: d.getFullYear(), month: d.getMonth() });
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    setFocusDay(new Date(d.getFullYear(), d.getMonth(), Math.min(focusDay.getDate(), last)));
  };
  const canPrev = new Date(view.year, view.month - 1, 1).getFullYear() >= MIN_YEAR;
  const canNext = new Date(view.year, view.month + 1, 1) <= today;

  const move = (days: number) => {
    const d = new Date(focusDay.getFullYear(), focusDay.getMonth(), focusDay.getDate() + days);
    if (d > today || d.getFullYear() < MIN_YEAR) return;
    setFocusDay(d);
    if (d.getMonth() !== view.month || d.getFullYear() !== view.year) setView({ year: d.getFullYear(), month: d.getMonth() });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      return onClose();
    }
    const keys: Record<string, () => void> = {
      ArrowLeft: () => move(-1),
      ArrowRight: () => move(1),
      ArrowUp: () => move(-7),
      ArrowDown: () => move(7),
      PageUp: () => go(view.year, view.month - 1),
      PageDown: () => go(view.year, view.month + 1),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  };

  const first = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.year, view.month, i + 1)),
  ];
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push([...cells.slice(i, i + 7), ...Array(Math.max(0, 7 - cells.slice(i, i + 7).length)).fill(null)]);
  const yearList = Array.from({ length: today.getFullYear() - MIN_YEAR + 1 }, (_, i) => today.getFullYear() - i);

  return (
    // Same placement as the address suggestions dropdown: under the field, field-width, 8px gap.
    <div ref={anchor} className="absolute inset-x-16 top-full z-30 mt-8 scroll-mb-24">
      <div
        ref={dialog}
        role="dialog"
        aria-label="Choose your date of birth"
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="toast-down overflow-hidden rounded-16 bg-background-raised shadow-overlay outline-none"
      >
        {/* Month and Year dropdowns between previous/next, like the earlier picker. */}
        <div className="flex items-center justify-between px-8 pt-12">
          <ArrowButton dir="prev" onClick={() => go(view.year, view.month - 1)} disabled={!canPrev} />
          <div className="flex items-center">
            <MiniSelect
              label="Month"
              value={view.month}
              onChange={(m) => go(view.year, m)}
              options={MONTHS.map((name, i) => ({
                value: i,
                label: name,
                disabled: view.year === today.getFullYear() && i > today.getMonth(),
              }))}
            />
            <MiniSelect
              label="Year"
              value={view.year}
              onChange={(y) => go(y, y === today.getFullYear() ? Math.min(view.month, today.getMonth()) : view.month)}
              options={yearList.map((y) => ({ value: y, label: String(y) }))}
            />
          </div>
          <ArrowButton dir="next" onClick={() => go(view.year, view.month + 1)} disabled={!canNext} />
        </div>

        <div ref={grid} role="grid" aria-label={`${MONTHS[view.month]} ${view.year}`} className="flex flex-col px-12">
          <div role="row" className="flex h-48">
            {WEEKDAYS.map((d, i) => (
              <span key={i} role="columnheader" className="type-tiny-bold flex flex-1 items-center justify-center text-text-weaker">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((week, w) => (
            <div role="row" key={w} className="flex h-48">
              {week.map((d, i) => {
                if (!d) return <span key={i} className="flex-1" />;
                const isSelected = sameDay(d, pending);
                const isToday = sameDay(d, today);
                return (
                  <span key={i} className="flex flex-1 items-center justify-center">
                    <button
                      type="button"
                      role="gridcell"
                      data-focus={sameDay(d, focusDay)}
                      tabIndex={sameDay(d, focusDay) ? 0 : -1}
                      disabled={d > today}
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`}
                      onClick={() => {
                        setPending(d);
                        setFocusDay(d);
                      }}
                      className={`flex size-40 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-brand-strong disabled:cursor-not-allowed disabled:text-text-disabled ${
                        isSelected
                          ? "type-small-bold bg-fill-brand-strong text-text-inverse-strong"
                          : isToday
                            ? "type-small-regular border border-stroke-brand-strong text-text-brand hover:bg-fill-brand-weak"
                            : "type-small-regular text-text-strong hover:bg-fill-weaker"
                      }`}
                    >
                      {d.getDate()}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>


        {/* Actions: Clear as the Design Library link (Tiny/Bold underlined), then the flow's secondary + primary buttons. */}
        <div className="flex items-center gap-12 border-t border-stroke-weaker px-20 pt-12 pb-16">
          <button
            type="button"
            onClick={() => setPending(null)}
            className="type-tiny-bold mr-auto rounded-12 px-4 py-[6px] text-text-brand underline decoration-from-font underline-offset-auto hover:no-underline focus-visible:outline-2 focus-visible:outline-stroke-brand-strong"
          >
            Clear
          </button>
          <Button variant="secondary" size="small" className="w-auto! px-16!" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" className="w-auto! px-16!" onClick={() => onSelect(pending ? toValue(pending) : "")}>
            OK
          </Button>
        </div>
      </div>
    </div>
  );
}
