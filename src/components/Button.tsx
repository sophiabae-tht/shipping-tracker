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
  const base = "flex w-full items-center justify-center gap-1 rounded-xl text-center transition-colors";
  const sizing = size === "small" ? "px-3 py-1.5 t-tiny-bold" : "px-4 py-3 t-small-bold";
  if (variant === "secondary") {
    return `${base} ${sizing} border border-brand text-text-brand hover:bg-brand/5`;
  }
  if (disabled) return `${base} ${sizing} bg-fill-disabled text-text-inverse cursor-not-allowed`;
  return `${base} ${sizing} bg-brand text-text-inverse drop-shadow-[0_2px_4px_rgba(12,15,65,0.05)] hover:bg-[#3a46d6]`;
}

/** Primary (solid) or secondary (outline) button; renders a link when `href` is set. */
export function Button({ variant = "primary", size = "default", icon, href, children, className = "", ...rest }: Props) {
  const content = (
    <>
      {icon && <img src={icon} alt="" width={20} height={20} />}
      <span className="px-1">{children}</span>
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
