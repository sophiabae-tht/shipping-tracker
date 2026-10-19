/** Page title + body copy block (pageHeader). */
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
      {topSpacer && <div className="h-4" />}
      <h1 className={`px-4 pt-4 text-text-strong ${size === "h3" ? "t-h3" : "t-h4"}`}>{title}</h1>
      {children}
      <div className="h-2" />
    </div>
  );
}

export function BodyCopy({ children }: { children: React.ReactNode }) {
  return <p className="t-small px-4 pt-3 text-text-weak">{children}</p>;
}

export function PrototypeLabel({ inverse = false }: { inverse?: boolean }) {
  return (
    <p className={`py-2 text-center text-[12px] leading-4 font-medium ${inverse ? "text-text-inverse-weak" : "text-text-weaker"}`}>
      Prototype · mock data
    </p>
  );
}

/** Sticky bottom bar holding the screen's buttons (appFooter). */
export function StickyFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 mt-auto bg-bg-base">
      <div className="flex flex-col gap-4 px-4 pt-4">{children}</div>
      <PrototypeLabel />
    </div>
  );
}

/** Centered illustration + message used for loading states. */
export function FullScreenMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center p-4" role="status" aria-live="polite">
      <div className="flex flex-1 flex-col items-center justify-end">
        <img src="/figma/loading.svg" alt="" width={96} height={96} className="animate-loading" />
      </div>
      <div className="flex w-full flex-col items-center py-2">
        <p className="t-h4 px-4 pt-4 text-center text-text-strong">{title}</p>
        <p className="t-small px-4 pt-3 text-center text-text-weak">{body}</p>
      </div>
      <div className="flex-1" />
      <PrototypeLabel />
    </div>
  );
}
