"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";

type MessageProps = { hint?: string; error?: string; id: string };

/** Hint (plain text, Figma inputTextField hintFrame) or error (WarningCircle icon) line under a field. */
function FieldMessage({ hint, error, id }: MessageProps) {
  if (!hint && !error) return null;
  if (!error)
    return (
      <p id={id} className="type-tiny-regular px-16 pt-8 text-text-weak">
        {hint}
      </p>
    );
  return (
    <div id={id} className="flex items-center gap-8 px-16 pt-8">
      <img src="/figma/warning-small.svg" alt="" width={16} height={16} className="shrink-0" />
      <p className="type-tiny-regular flex-1 text-text-error">{error}</p>
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
  /** Icon shown while the field is focused or active (inputTextField focused: icon/weak instead of icon/weaker). */
  focusedIcon?: string;
  /** Makes the icon a button (e.g. the calendar opening the date picker). */
  onIconClick?: () => void;
  iconLabel?: string;
  /** Keeps the focused look while something attached to the field is open, e.g. the date picker (Figma dateDropdown open=true). */
  active?: boolean;
  value: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, focusedIcon, onIconClick, iconLabel, active, value, onFocus, onBlur, className = "", ...rest },
  ref,
) {
  const id = useId();
  const [hasFocus, setFocused] = useState(false);
  const focused = hasFocus || !!active;
  const raised = focused || value.length > 0;
  const iconSrc = focused && focusedIcon ? focusedIcon : icon;
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
        {iconSrc &&
          (onIconClick ? (
            <button
              type="button"
              onClick={onIconClick}
              aria-label={iconLabel}
              aria-expanded={active}
              data-datepicker-toggle
              className="-mr-8 ml-0 shrink-0 rounded-12 p-8 hover:bg-fill-weaker focus-visible:outline-2 focus-visible:outline-stroke-brand-strong"
            >
              <img src={iconSrc} alt="" width={24} height={24} />
            </button>
          ) : (
            <img src={iconSrc} alt="" width={24} height={24} className="ml-8 shrink-0" />
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
  /** Gets the value the field was left with, since a change made on leaving hasn't reached the parent yet. */
  onBlur?: (value: string) => void;
};

/** Options starting with the typed text first, then ones containing it. */
function filterOptions(options: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const starts = options.filter((o) => o.toLowerCase().startsWith(q));
  return [...starts, ...options.filter((o) => !starts.includes(o) && o.toLowerCase().includes(q))];
}

/**
 * inputSelect with a dropdown under the field, like the address suggestions and date picker (8px gap,
 * radius-16, overlay shadow). The options take the Design Library accordionPanel list spacing and colors:
 * Small/Regular text/weak, 24px between items; hovered/selected items text/strong.
 * The field is also typeable: typing filters the list (starts-with first, then contains). Leaving the field
 * keeps an exact match (any case, e.g. "tx" → TX) or the only option starting with the text ("hum" → Humana),
 * and otherwise goes back to the last picked value.
 * Clicking the field or caret opens the list. Keyboard: ↑/↓ move, Enter picks, Esc closes.
 */
export function Select({ label, options, hint, error, value, onChange, onBlur }: SelectProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  // What the member has typed since the last pick; null shows the picked value.
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const shown = query === null ? options : filterOptions(options, query);
  const text = query ?? value;

  const openList = () => {
    setActive(Math.max(0, shown.indexOf(value)));
    setOpen(true);
  };
  const pick = (option: string) => {
    onChange(option);
    setQuery(null);
    setOpen(false);
  };

  // Leaving the field: keep the match, clear on empty text, otherwise restore the last pick. A pick
  // skips the field's check (e.g. "Select your health plan."), which would read the value before it lands.
  const commit = () => {
    setOpen(false);
    if (query === null) return onBlur?.(value);
    const q = query.trim().toLowerCase();
    const prefixed = q ? options.filter((o) => o.toLowerCase().startsWith(q)) : [];
    const match = options.find((o) => o.toLowerCase() === q) ?? (prefixed.length === 1 ? prefixed[0] : undefined);
    setQuery(null);
    if (match) {
      if (match !== value) onChange(match);
      return;
    }
    const left = q ? value : "";
    if (left !== value) onChange(left);
    onBlur?.(left);
  };

  // Keep the active option in view inside long lists (State).
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => Math.min(shown.length - 1, Math.max(0, i + step)));
    } else if (e.key === "Enter" && open && shown[active]) {
      e.preventDefault();
      pick(shown[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery(null);
    }
  };

  return (
    <div className="w-full px-16 pt-16">
      <div className={`${boxClasses(focused, error)} cursor-text`} 
        onMouseDown={(e) => {
          // A click on the box's padding or label acts like a click in the field; the caret handles its own.
          const target = e.target as HTMLElement;
          if (target === input.current || target.closest("button, [role=listbox]")) return;
          e.preventDefault();
          input.current?.focus();
          if (!open) openList();
        }}
      >
        <FloatingLabel htmlFor={id} label={label} raised={focused || text.length > 0} />
        <input
          ref={input}
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && shown.length > 0}
          aria-controls={listId}
          aria-activedescendant={open && shown[active] ? `${listId}-${active}` : undefined}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          autoComplete="off"
          value={text}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit();
          }}
          className={`${fieldText} pr-32 text-text-strong`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={open ? `Close ${label} list` : `Open ${label} list`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            input.current?.focus();
            if (open) setOpen(false);
            else openList();
          }}
          className="absolute right-0 flex h-full items-center pr-16 pl-8"
        >
          {/* Figma selectDropdown keeps the caret pointing down while the list is open. */}
          <img src="/figma/caret-down.svg" alt="" width={16} height={16} />
        </button>
        {open && shown.length > 0 && (
          <ul
            ref={list}
            id={listId}
            role="listbox"
            aria-label={label}
            className="toast-down absolute inset-x-0 top-full z-30 mt-8 max-h-[336px] overflow-y-auto rounded-16 bg-background-raised py-12 shadow-overlay"
          >
            {shown.map((o, i) => (
              <li
                key={o}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={o === value}
                // Keep focus in the field until the pick lands.
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
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
