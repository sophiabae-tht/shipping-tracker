/** pageHeader: heading + body copy block. */
export function PageHeading({
  title,
  size = "h4",
  topSpacer = false,
  children,
}: {
  title: string;
  size?: "h3" | "h4";
  topSpacer?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      {topSpacer && <div className="h-16" />}
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

/** Centered content column for single-column screens (forms) on tablet and desktop. */
export const FORM_COLUMN = "mx-auto flex w-full flex-1 flex-col md:max-w-[592px] md:px-16 md:pt-32";

/** appFooter: sticky bottom bar on mobile; sits in the page flow under the form on tablet and desktop. */
export function StickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto bg-background-base md:static md:mt-0 md:pt-8 md:pb-32">
      <div className="flex flex-col gap-16 px-16 pt-16">{children}</div>
      <PrototypeLabel />
    </div>
  );
}

/** fullScreenMessage: centered illustration + message used for loading states. */
export function FullScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center p-16" role="status" aria-live="polite">
      <div className="flex flex-1 flex-col items-center justify-end">
        <img src="/figma/loading.svg" alt="" width={96} height={96} className="animate-loading" />
      </div>
      <div className="flex w-full flex-col items-center py-8">
        <p className="type-heading4-bold px-16 pt-16 text-center text-text-strong">{title}</p>
        <p className="type-small-regular px-16 pt-12 text-center text-text-weak">{body}</p>
      </div>
      <div className="flex-1" />
      <PrototypeLabel />
    </div>
  );
}
