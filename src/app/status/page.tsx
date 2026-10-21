"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { CallLink, Toast } from "@/components/Feedback";
import { PageCard, PageShell, SideCard } from "@/components/PageShell";
import { OrderTracker } from "@/components/OrderTracker";
import { PageHeading, PrototypeLabel } from "@/components/Screen";
import {
  CONTACT,
  TRACKING_NUMBER,
  TRACKING_URL,
  formatAddressLines,
  memberByKey,
  type Member,
  type Status,
} from "@/lib/data";
import { useHref, useMode } from "@/lib/nav";
import { useAddressStore } from "@/lib/store";

type Copy = { title: string; subline: string; sublineStyle: "body" | "h4"; note: React.ReactNode };

const ORDERED_NOTE_FULL = "You can change your address until your order is prepared for shipment.";
const ORDERED_NOTE_CALL = (
  <>
    Not your address? Call us at <CallLink />
  </>
);

function copyFor(member: Member, fullMode: boolean): Copy {
  const status: Status = member.status;
  if (status === "ordered") {
    const note = fullMode ? ORDERED_NOTE_FULL : ORDERED_NOTE_CALL;
    return member.aep
      ? {
          title: "You’re enrolled!",
          subline:
            "Your Humana plan starts Jan 1, 2027. We’ll prepare your phone for shipment closer to that date and notify you when it ships.",
          sublineStyle: "body",
          note,
        }
      : {
          title: "Your order is placed!",
          subline:
            "Your phone will be prepared for shipment soon. Please review your shipping address below to make sure it’s correct.",
          sublineStyle: "body",
          note,
        };
  }
  const copy: Record<Exclude<Status, "ordered">, Copy> = {
    preparingToShip: {
      title: "We're getting your phone ready to ship.",
      subline: "We’ll send you tracking information once your order has shipped.",
      sublineStyle: "body",
      note: (
        <>
          Your order is now being prepared. If this address isn’t correct, please call us at <CallLink />
        </>
      ),
    },
    shipped: {
      title: "Your phone is on its way!",
      subline: "Expected by Oct 30, 2026",
      sublineStyle: "h4",
      note: (
        <>
          Your phone has shipped. If this address isn’t correct, please call us at <CallLink />
        </>
      ),
    },
    outForDelivery: {
      title: "Your phone is out for delivery.",
      subline: "Arriving today by 5 PM ET",
      sublineStyle: "h4",
      note: (
        <>
          Your phone is out for delivery. If this address isn’t correct, please call us at <CallLink />
        </>
      ),
    },
    delivered: {
      title: "Your phone has been delivered!",
      subline: "Delivered on Oct 30, 2026",
      sublineStyle: "h4",
      note: (
        <>
          If you haven’t received your phone, please call us at <CallLink />
        </>
      ),
    },
  };
  return copy[status];
}

function TrackingInfo() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TRACKING_NUMBER.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="flex flex-col gap-12 px-16 pt-16">
      <div className="flex flex-col gap-4">
        <p className="type-uppercase text-[12px] text-text-weaker">Carrier</p>
        <p className="type-small-regular text-text-strong">USPS</p>
      </div>
      <div className="flex flex-col gap-4">
        <p className="type-uppercase text-[12px] text-text-weaker">Tracking Number</p>
        <div className="flex items-center gap-8">
          <a href={TRACKING_URL} target="_blank" rel="noopener noreferrer" className="type-small-regular text-text-strong underline">
            {TRACKING_NUMBER}
          </a>
          <button type="button" onClick={copy} aria-label="Copy tracking number" className="-m-4 p-4">
            <img src="/figma/copy.svg" alt="" width={20} height={20} />
          </button>
          <span aria-live="polite" className="type-tiny-regular text-text-weaker">
            {copied ? "Copied" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ id, title, action, topPad = "pt-16" }: { id?: string; title: string; action?: React.ReactNode; topPad?: string }) {
  return (
    <div className={`px-16 ${topPad}`}>
      <div className="flex items-center justify-between border-t border-stroke-weaker pt-16">
        <h2 id={id} className="type-small-bold flex-1 text-text-strong">{title}</h2>
        {action}
      </div>
    </div>
  );
}

function OrderDetails() {
  return (
    <div className="pt-8">
      <div className="rounded-16 border border-stroke-weaker bg-fill-weaker">
        <div className="flex flex-col gap-24 rounded-16 bg-fill-inverse-weaker p-16">
          <div className="flex items-start gap-16">
            <div className="flex w-48 items-center justify-center rounded-full bg-fill-brand-weaker p-12">
              <img src="/figma/cell-signal.svg" alt="" width={24} height={24} />
            </div>
            <div>
              <p className="type-small-bold text-text-strong">Basic 5G</p>
              <p className="type-small-regular text-text-weak">$0/mo</p>
            </div>
          </div>
          <div className="flex items-start gap-16">
            <img
              src="/figma/device.png"
              alt=""
              width={48}
              height={48}
              className="size-48 rounded-4 border border-stroke-weak bg-background-raised object-cover"
            />
            <div>
              <p className="type-small-bold text-text-strong">Device name</p>
              <p className="type-small-regular text-text-weak">$95.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DETAILS_KEY = "status-details-open";

function StatusPage() {
  const params = useSearchParams();
  const router = useRouter();
  const href = useHref();
  const mode = useMode();
  const { addressFor } = useAddressStore();
  const member = memberByKey(params.get("m"));
  const justUpdated = params.get("updated") === "1";
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(justUpdated);

  // Coming back from Change address, Order details is left as the member had it before they went.
  useEffect(() => {
    try {
      const key = `${DETAILS_KEY}:${params.get("m")}`;
      if (sessionStorage.getItem(key) === "1") setDetailsOpen(true);
      sessionStorage.removeItem(key);
    } catch {}
  }, [params]);

  // No member in the URL: send them to look up their order instead of showing an empty state.
  useEffect(() => {
    if (!member) router.replace(href("/lookup"));
  }, [member, router, href]);
  if (!member) return null;

  const fullMode = mode === "full";
  const canChange = fullMode && member.status === "ordered";
  const copy = copyFor(member, fullMode);
  const address = addressFor(member.key);
  const name = `${member.firstName} ${member.lastName}`;
  const addressLines = [name, ...formatAddressLines(address)];
  const hasTracking = member.status === "shipped" || member.status === "outForDelivery" || member.status === "delivered";
  const goChange = () => {
    try {
      sessionStorage.setItem(`${DETAILS_KEY}:${member.key}`, detailsOpen ? "1" : "0");
    } catch {}
    router.push(href("/address", { m: member.key }));
  };

  return (
    <>
      {/* Enrollment desktop04 layout: main card (432, live enrollment width) + side card (352); stacked below 856px. */}
      <PageShell backHref={href("/lookup")}>
        <PageCard className="screen-enter flex-none">
          <PageHeading title={copy.title} size="h3" topSpacer="md">
            {copy.sublineStyle === "h4" ? (
              <p className="type-heading4-bold px-16 pt-12 text-text-weak">{copy.subline}</p>
            ) : (
              <p className="type-small-regular px-16 pt-12 text-text-weak">{copy.subline}</p>
            )}
            {hasTracking && <TrackingInfo />}
          </PageHeading>

          <OrderTracker status={member.status} showAddress={canChange} addressLines={addressLines} onChangeAddress={goChange} />
        </PageCard>

        <SideCard className="screen-enter screen-enter-late">
          {/* In the side card, the card edge replaces the first divider and its top spacing (24 + 16 = 40px, matching the bottom). */}
          <div className="px-16 pt-16 web:pt-0 web:[&>div]:border-t-0">
            <Accordion title="Order details" open={detailsOpen} onToggle={() => setDetailsOpen((v) => !v)}>
              <OrderDetails />
            </Accordion>
          </div>

          <section aria-labelledby="shipping-address">
            <SectionHeader
              id="shipping-address"
              title="Shipping address"
              action={
                canChange ? (
                  <button type="button" onClick={goChange} className="type-small-bold text-text-brand">
                    Change
                  </button>
                ) : undefined
              }
            />
            <address className="type-small-regular px-16 pt-16 not-italic text-text-strong">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </address>
            <p className="type-small-regular px-16 pt-16 text-text-weak">{copy.note}</p>
          </section>

          <section aria-labelledby="contact-info">
            <SectionHeader id="contact-info" title="Contact info" topPad="pt-24" />
            <div className="type-small-regular px-16 pt-16 text-text-strong">
              <p>{CONTACT.phone}</p>
              <p>{CONTACT.email}</p>
            </div>
            <p className="type-small-regular px-16 pt-16 text-text-weak">
              Not your contact info? Call us at <CallLink />
            </p>
          </section>
          <div className={`web:hidden ${toastOpen ? "h-[96px]" : "h-[40px]"}`} />
          <div className="web:hidden">
          <PrototypeLabel />
          </div>
        </SideCard>
      </PageShell>

      {toastOpen && (
        <Toast title="Your address is updated" onClose={() => setToastOpen(false)} />
      )}
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StatusPage />
    </Suspense>
  );
}
