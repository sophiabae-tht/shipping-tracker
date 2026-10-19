"use client";

import { forwardRef, useId, useState } from "react";

type MessageProps = { hint?: string; error?: string; id: string };

/** Hint (info icon) or error (warning icon) line under a field. */
function FieldMessage({ hint, error, id }: MessageProps) {
  if (!hint && !error) return null;
  return (
    <div id={id} className="flex items-center gap-2 px-4 pt-2">
      <img src={error ? "/figma/warning-small.svg" : "/figma/info.svg"} alt="" width={16} height={16} className="shrink-0" />
      <p className={`t-tiny flex-1 ${error ? "text-text-error" : "text-text-weak"}`}>{error ?? hint}</p>
    </div>
  );
}

function boxClasses(focused: boolean, error?: string) {
  const base = "relative flex h-16 w-full items-center rounded-2xl px-4 transition-shadow";
  if (error) return `${base} bg-fill-error-weak shadow-[inset_0_0_0_2px_var(--color-stroke-error)]`;
  if (focused) return `${base} bg-bg-raised shadow-[inset_0_0_0_2px_var(--color-brand)]`;
  return `${base} bg-bg-raised shadow-[inset_0_0_0_1px_var(--color-stroke-weak)]`;
}

/** Floating label: 16px placeholder when empty, 14px label above the value once filled or focused. */
function FloatingLabel({ htmlFor, label, raised }: { htmlFor: string; label: string; raised: boolean }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`pointer-events-none absolute left-4 text-text-weaker transition-all ${
        raised ? "top-[10px] t-tiny" : "top-5 t-small"
      }`}
    >
      {label}
    </label>
  );
}

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
    <div className={`w-full px-4 pt-4 ${className}`}>
      <div className={boxClasses(focused, error)}>
        <FloatingLabel htmlFor={id} label={label} raised={raised} />
        <input
          ref={ref}
          id={id}
          value={value}
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-msg` : undefined}
          className="t-small h-full min-w-0 flex-1 bg-transparent pt-[30px] pb-[10px] text-text-strong outline-none"
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
        {icon && <img src={icon} alt="" width={24} height={24} className="ml-2 shrink-0" />}
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
    <div className="w-full px-4 pt-4">
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
          className={`t-small h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent pt-[30px] pb-[10px] outline-none ${
            value ? "text-text-strong" : "text-transparent"
          }`}
        >
          <option value="" disabled hidden />
          {options.map((o) => (
            <option key={o} value={o} className="text-text-strong">
              {o}
            </option>
          ))}
        </select>
        <img src="/figma/caret-down.svg" alt="" width={16} height={16} className="pointer-events-none ml-2 shrink-0" />
      </div>
      <FieldMessage id={`${id}-msg`} hint={hint} error={error} />
    </div>
  );
}
