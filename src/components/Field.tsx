"use client";

import { forwardRef, useId, useState } from "react";

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
  value: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value">;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, icon, value, onFocus, onBlur, className = "", ...rest },
  ref,
) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;
  return (
    <div className={`w-full px-16 pt-16 ${className}`}>
      <div className={boxClasses(focused, error)}>
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
        {icon && <img src={icon} alt="" width={24} height={24} className="ml-8 shrink-0" />}
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

export function Select({ label, options, hint, error, value, onChange, onBlur }: SelectProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  return (
    <div className="w-full px-16 pt-16">
      <div className={boxClasses(focused, error)}>
        <FloatingLabel htmlFor={id} label={label} raised={value.length > 0} />
        <select
          id={id}
          value={value}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          className={`${fieldText} cursor-pointer appearance-none ${value ? "text-text-strong" : "text-transparent"}`}
        >
          <option value="" disabled hidden />
          {options.map((o) => (
            <option key={o} value={o} className="text-text-strong">
              {o}
            </option>
          ))}
        </select>
        <img src="/figma/caret-down.svg" alt="" width={16} height={16} className="pointer-events-none ml-8 shrink-0" />
      </div>
      <FieldMessage id={`${id}-msg`} hint={hint} error={error} />
    </div>
  );
}
