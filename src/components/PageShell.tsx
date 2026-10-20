import { Header } from "./Header";
import { PrototypeLabel } from "./Screen";

/**
 * Responsive page frame.
 * Mobile: the 360px Shipping frames (topAppBar, full-bleed content, sticky footer buttons).
 * web+: the Enrollment desktop layout (the live site's gradient page background is on <html>), webHeaderDesktop,
 * and centered cards (main 432px like enroll.thrivemobile.com; on split an optional 352px side card, 24px apart).
 */
export function PageShell({
  backHref,
  onBack,
  children,
}: {
  backHref?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <Header backHref={backHref} onBack={onBack} />
      <main className="flex flex-1 flex-col web:flex-none web:items-center web:gap-24 web:px-24 web:pt-12 web:pb-40 split:flex-row split:items-start split:justify-center">
        {children}
      </main>
      <div className="mt-auto hidden web:block">
        <PrototypeLabel />
      </div>
    </div>
  );
}

/** maxWidth card (432px to match the live enrollment card, fill/inverseWeak, radius-24). */
export function PageCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`flex flex-1 flex-col web:w-full web:max-w-[432px] web:flex-none split:w-[432px] web:rounded-24 web:bg-fill-inverse-weak web:px-24 web:pt-8 web:pb-40 ${className}`}
    >
      {children}
    </div>
  );
}

/** Side maxWidth card (352px, fill/inverseWeaker, radius 24) used next to the main card on desktop. */
export function SideCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <aside
      className={`web:w-full web:max-w-[432px] web:rounded-24 web:bg-fill-inverse-weaker web:px-24 web:pt-24 web:pb-40 split:w-[352px] split:max-w-none ${className}`}
    >
      {children}
    </aside>
  );
}
