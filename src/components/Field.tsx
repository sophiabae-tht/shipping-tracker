"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";

type MessageProps = { hint?: string; error?: string; id: string };

/** Hint (Info icon) or error (WarningCircle icon) line under a field. */
function FieldMessage({ hint, error, id }: MessageProps) {
  if (!hint && !error) return null;
  return (
    <div id={id} className="flex items-center gap-8 px-16 pt-8">
      <img src={error ? "/figma/warning-small.svg" : "/figma/info.svg"} alt="" width={16} height={16} className="shrink-0" />
      <p className={`type-tiny-regular flex-1 ${error ? "text-text-error" : "text-text-weak"}`}>{error ?? hint}</p>
    </div>
  );
}

// textInput: stroke/weak 1px at rest, stroke/brandStrong 2px when focused, stroke/errorStrong 2px + fill/errorWeak on error.
// Strokes are drawn as inset shadows so the 1px -> 2px change doesn't shift layout.
function boxClasses(focused: boolean, error?: string) {
  const base = "relative flex h-[64px] w-full items-center rounded-16 px-16 transition-shadow";
  if (error) return `${base} bg-fill-error-weak shadow-[inset_0_0_0_2px_var(--color-stroke-error-strong)]`;
  if (focused) return `${base} bg-background-raised shadow-[inset_0_0_0_2px_var(--color-stroke-brand-strong)]`;
  return `${base} bg-background-raised shadow-[inset_0_0_0_1px_var(--color-stroke-weak)]`;
}

/** Empty: Small/Regular placeholder (py spacing/20). Filled or focused: Tiny/Regular label above the value (py 10). */
function FloatingLabel({ htmlFor, label, raised }: { htmlFor: string; label: string; raised: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`pointer-events-none absolute left-16 text-text-weaker transition-all ${
        raised ? "top-[10px] type-tiny-regular" : "top-20 type-small-regular"
      }`}
    >
      {label}
    </label>
  );
}

const fieldText = "type-small-regular h-full min-w-0 flex-1 bg-transparent pt-[30px] pb-[10px] outline-none";

type InputProps = {
  label: string;
  hint?: string;
  error?: string;
  icon?: string;
  /** Makes the icon a button (e.g. the calendar opening the date picker). */
  onIconClick?: () => void;
  iconLabel?: string;
  value: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, onIconClick, iconLabel, value, onFocus, onBlur, className = "", ...rest },
  ref,
) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div className={`w-full px-16 pt-16 ${className}`}>
      {/* A click anywhere in the box (icon included, e.g. the Address search icon) puts the cursor in the field.
          Icon buttons such as the date-picker toggle keep their own action. */}
      <div
        className={`${boxClasses(focused, error)} cursor-text`}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.tagName === "INPUT") return;
          e.preventDefault();
          (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus();
        }}
      >
        <FloatingLabel htmlFor={id} label={label} raised={raised} />
        <input
          ref={ref}
          id={id}
          value={value}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          className={`${fieldText} text-text-strong`}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {icon &&
          (onIconClick ? (
            <button
              type="button"
              onClick={onIconClick}
              aria-label={iconLabel}
              data-datepicker-toggle
              className="-mr-8 ml-0 shrink-0 rounded-12 p-8 hover:bg-fill-weaker focus-visible:outline-2 focus-visible:outline-stroke-brand-strong"
            >
              <img src={icon} alt="" width={24} height={24} />
            </button>
          ) : (
            <img src={icon} alt="" width={24} height={24} className="ml-8 shrink-0" />
          ))}
      </div>
      <FieldMessage id={`${id}-msg`} hint={hint} error={error} />
    </div>
  );
});

type SelectProps = {
  label: string;
  options: string[];
  hint?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

/**
 * inputSelect with a dropdown under the field, like the address suggestions and date picker (8px gap,
 * radius-16, overlay shadow; closes on outside click). The options take the Design Library accordionPanel
 * list spacing and colors: Small/Regular text/weak, 24px between items; hovered/selected items text/strong.
 * The whole field, caret included, opens it. Keyboard: ↑/↓ move, Enter/Space pick, Esc closes,
 * typing a letter jumps to the first match.
 */
export function Select({ label, options, hint, error, value, onChange, onBlur }: SelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const openList = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  // Closing without a pick runs the field's check (e.g. "Select your health plan."); a pick doesn't need it,
  // and running it then would read the value before the change lands.
  const close = (refocus = true, validate = true) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
    if (validate) onBlur?.();
  };
  const pick = (i: number) => {
    onChange(options[i]);
    close(true, false);
  };

  // Close on outside click, like the other dropdowns.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active option in view inside long lists (State).
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((i) => Math.min(options.length - 1, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(options.length - 1);
    else if (e.key === "Enter" || e.key === " ") pick(active);
    else if (e.key === "Escape" || e.key === "Tab") return close(e.key === "Escape");
    else if (/^[a-z0-9]$/i.test(e.key)) {
      const i = options.findIndex((o) => o.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
      return;
    } else return;
    e.preventDefault();
  };

  return (
    <div ref={root} className="w-full px-16 pt-16">
      <div className={boxClasses(open, error)}>
        <FloatingLabel htmlFor={id} label={label} raised={value.length > 0} />
        <button
          ref={trigger}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${listId}-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
          // Tabbing past without opening still validates (e.g. "Select your health plan.").
          onBlur={() => {
            if (!open) onBlur?.();
          }}
          className={`${fieldText} absolute inset-0 rounded-16 pr-48 pl-16 text-left ${value ? "text-text-strong" : "text-transparent"}`}
        >
          {value}
        </button>
        <img
          src="/figma/caret-down.svg"
          alt=""
          width={16}
          height={16}
          className={`pointer-events-none absolute right-16 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open && (
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={label}
            className="toast-down absolute inset-x-0 top-full z-30 mt-8 max-h-[336px] overflow-y-auto rounded-16 bg-background-raised py-12 shadow-overlay"
          >
            {options.map((o, i) => (
              <li
                key={o}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o === value}
                // Keep focus on the trigger until the pick lands.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(i)}
                className={`cursor-pointer px-16 py-12 transition-colors ${
                  o === value ? "type-small-bold text-text-strong" : i === active ? "type-small-regular text-text-strong" : "type-small-regular text-text-weak"
                }`}
              >
                {o}
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldMessage id={`${id}-msg`} hint={hint} error={error} />
    </div>
  );
}
