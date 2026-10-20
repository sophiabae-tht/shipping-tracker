import { BackLink, Header } from "./Header";
import { PrototypeLabel } from "./Screen";

/**
 * Responsive page frame.
 * Mobile: the 360px Shipping frames (topAppBar, full-bleed content, sticky footer buttons).
 * md+: the Enrollment desktop layout: background/sunken page with gradientBG, webHeaderDesktop,
 * and centered cards (main 480px; on lg an optional 352px side card, 24px apart).
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
    <div className="relative isolate flex flex-1 flex-col md:bg-background-sunken">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden md:block">
        <img src="/figma/web-gradient-green.svg" alt="" className="absolute top-[-37px] right-[-284px] size-[1024px] max-w-none" />
        <img src="/figma/web-gradient-blue.svg" alt="" className="absolute top-[269px] left-[-397px] size-[1024px] max-w-none" />
      </div>
      <Header backHref={backHref} onBack={onBack} />
      <main className="flex flex-1 flex-col md:flex-none md:items-center md:gap-24 md:px-24 md:pb-40 lg:flex-row lg:items-start lg:justify-center">
        {children}
      </main>
      <div className="mt-auto hidden md:block">
        <PrototypeLabel />
      </div>
    </div>
  );
}

/** maxWidth card (480px, fill/inverseWeak, radius 24). Holds the back arrow row on md+. */
export function PageCard({
  backHref,
  onBack,
  className = "",
  children,
}: {
  backHref?: string;
  onBack?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-1 flex-col md:w-[480px] md:flex-none md:rounded-[24px] md:bg-fill-inverse-weak md:px-24 md:pt-8 md:pb-40 ${className}`}
    >
      {(backHref || onBack) && (
        // progressBarFrame without the progress bar: the shipping flow has no steps.
        <div className="hidden h-48 items-center gap-16 px-16 pt-24 md:flex">
          <BackLink backHref={backHref} onBack={onBack} />
        </div>
      )}
      {children}
    </div>
  );
}

/** Side maxWidth card (352px, fill/inverseWeaker, radius 24) used next to the main card on desktop. */
export function SideCard({ children }: { children: React.ReactNode }) {
  return (
    <aside className="md:w-[480px] md:rounded-[24px] md:bg-fill-inverse-weaker md:px-24 md:pt-24 md:pb-40 lg:w-[352px]">
      {children}
    </aside>
  );
}
