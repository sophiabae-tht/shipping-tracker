/** pageHeader: heading + body copy block. */
export function PageHeading({
  title,
  size = "h4",
  topSpacer = false,
  children,
}: {
  title: string;
  size?: "h3" | "h4";
  /** true: always (form screens); "md": only in the desktop card layout, as in the Enrollment pageHeader. */
  topSpacer?: boolean | "md";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {topSpacer && <div className={topSpacer === "md" ? "hidden h-16 web:block" : "h-16"} />}
      <h1 className={`px-16 pt-16 text-text-strong ${size === "h3" ? "type-heading3-bold" : "type-heading4-bold"}`}>{title}</h1>
      {children}
      <div className="h-8" />
    </div>
  );
}

export function BodyCopy({ children }: { children: React.ReactNode }) {
  return <p className="type-small-regular px-16 pt-12 text-text-weak">{children}</p>;
}

export function PrototypeLabel({ inverse = false }: { inverse?: boolean }) {
  return (
    <p className={`type-tiny-regular py-8 text-center ${inverse ? "text-text-inverse-weak" : "text-text-weaker"}`}>
      Prototype · mock data
    </p>
  );
}

/**
 * Mobile: appFooter, a sticky bottom bar. web+: buttonGroupWide in the card's flow
 * (spacer/16 + pt spacing/16), as in the Enrollment desktop frames.
 */
export function StickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto bg-background-base web:static web:mt-0 web:bg-transparent web:pt-16">
      <div className="flex flex-col gap-16 px-16 pt-16">{children}</div>
      <div className="web:hidden">
        <PrototypeLabel />
      </div>
    </div>
  );
}

/** How long the loading message takes to fade out before the next page enters (matches .screen-exit). */
export const SCREEN_EXIT_MS = 220;

/** Classes for the card holding a loading message: fade in, then fade out (with its card) when leaving. */
export const loadingCardMotion = (leaving: boolean) => (leaving ? "screen-exit" : "screen-fade-in");

/** fullScreenMessage: centered illustration + message used for loading states. */
export function FullScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center p-16 web:min-h-[576px]" role="status" aria-live="polite">
      <div className="flex flex-1 flex-col items-center justify-end">
        <img src="/figma/loading.svg" alt="" width={96} height={96} className="animate-loading" />
      </div>
      <div className="flex w-full flex-col items-center py-8">
        <p className="type-heading4-bold px-16 pt-16 text-center text-text-strong">{title}</p>
        <p className="type-small-regular px-16 pt-12 text-center text-text-weak">{body}</p>
      </div>
      <div className="flex-1" />
      <div className="web:hidden">
        <PrototypeLabel />
      </div>
    </div>
  );
}
