import Link from "next/link";

type Variant = "primary" | "secondary";
type Size = "default" | "small";

type Props = {
  variant?: Variant;
  size?: Size;
  icon?: string;
  href?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">;

function classes(variant: Variant, size: Size, disabled?: boolean) {
  const base = "flex w-full items-center justify-center gap-4 rounded-12 text-center transition-colors";
  // Figma "button" (px spacing/16, py spacing/12) and "changeAddressButton" (px spacing/12, py 6).
  const sizing = size === "small" ? "px-12 py-[6px] type-tiny-bold" : "px-16 py-12 type-small-bold";
  if (variant === "secondary") {
    return `${base} ${sizing} border border-stroke-brand-strong text-text-brand hover:bg-fill-weaker`;
  }
  if (disabled) return `${base} ${sizing} bg-fill-disabled text-text-inverse-strong cursor-not-allowed`;
  return `${base} ${sizing} bg-fill-brand-strong text-text-inverse-strong shadow-raised hover:opacity-90`;
}

/** Primary (solid) or secondary (outline) button; renders a link when `href` is set. */
export function Button({ variant = "primary", size = "default", icon, href, children, className = "", ...rest }: Props) {
  const content = (
    <>
      {icon && <img src={icon} alt="" width={20} height={20} />}
      <span className="px-4">{children}</span>
    </>
  );
  const cls = `${classes(variant, size, rest.disabled)} ${className}`;
  if (href) {
    const isExternal = href.startsWith("tel:") || href.startsWith("http");
    return isExternal ? (
      <a href={href} className={cls}>
        {content}
      </a>
    ) : (
      <Link href={href} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {content}
    </button>
  );
}
