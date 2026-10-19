"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { CallLink, Toast } from "@/components/Feedback";
import { Header } from "@/components/Header";
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
      title: "We’re getting your phone ready to ship.",
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
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="flex flex-col gap-1">
        <p className="t-upper text-[12px] text-text-weaker">Carrier</p>
        <p className="t-small text-text-strong">USPS</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="t-upper text-[12px] text-text-weaker">Tracking Number</p>
        <div className="flex items-center gap-2">
          <a href={TRACKING_URL} target="_blank" rel="noopener noreferrer" className="t-small text-text-strong underline">
            {TRACKING_NUMBER}
          </a>
          <button type="button" onClick={copy} aria-label="Copy tracking number" className="-m-1 p-1">
            <img src="/figma/copy.svg" alt="" width={20} height={20} />
          </button>
          <span aria-live="polite" className="t-tiny text-text-weaker">
            {copied ? "Copied" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, action, topPad = "pt-4" }: { title: string; action?: React.ReactNode; topPad?: string }) {
  return (
    <div className={`px-4 ${topPad}`}>
      <div className="flex items-center justify-between border-t border-stroke-weaker pt-4">
        <h2 className="t-small-bold flex-1 text-text-strong">{title}</h2>
        {action}
      </div>
    </div>
  );
}

function OrderDetails() {
  return (
    <div className="pt-2">
      <div className="rounded-2xl border border-stroke-weaker bg-fill-weaker">
        <div className="flex flex-col gap-6 rounded-2xl bg-white/30 p-4">
          <div className="flex items-start gap-4">
            <div className="flex w-12 items-center justify-center rounded-full bg-illo-brandweak p-3">
              <img src="/figma/cell-signal.svg" alt="" width={24} height={24} />
            </div>
            <div>
              <p className="t-small-bold text-text-strong">Basic 5G</p>
              <p className="t-small text-text-weak">$0/mo</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <img
              src="/figma/device.png"
              alt=""
              width={48}
              height={48}
              className="size-12 rounded border border-stroke-weak bg-white object-cover"
            />
            <div>
              <p className="t-small-bold text-text-strong">Device name</p>
              <p className="t-small text-text-weak">$95.00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPage() {
  const params = useSearchParams();
  const router = useRouter();
  const href = useHref();
  const mode = useMode();
  const { addressFor } = useAddressStore();
  const member = memberByKey(params.get("m"));
  const justUpdated = params.get("updated") === "1";
  const [detailsOpen, setDetailsOpen] = useState(justUpdated);
  const [toastOpen, setToastOpen] = useState(justUpdated);

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
  const goChange = () => router.push(href("/address", { m: member.key }));

  return (
    <>
      <Header backHref={href("/lookup")} />
      <main className="flex flex-1 flex-col">
        <PageHeading title={copy.title} size="h3">
          {copy.sublineStyle === "h4" ? (
            <p className="t-h4 px-4 pt-3 text-text-weak">{copy.subline}</p>
          ) : (
            <p className="t-small px-4 pt-3 text-text-weak">{copy.subline}</p>
          )}
          {hasTracking && <TrackingInfo />}
        </PageHeading>

        <OrderTracker status={member.status} showAddress={canChange} addressLines={addressLines} onChangeAddress={goChange} />

        <div className="px-4 pt-4">
          <Accordion title="Order details" open={detailsOpen} onToggle={() => setDetailsOpen((v) => !v)}>
            <OrderDetails />
          </Accordion>
        </div>

        <section aria-labelledby="shipping-address">
          <SectionHeader
            title="Shipping address"
            action={
              canChange ? (
                <button type="button" onClick={goChange} className="t-small-bold text-text-brand">
                  Change
                </button>
              ) : undefined
            }
          />
          <address className="t-small px-4 pt-4 not-italic text-text-strong">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </address>
          <p className="t-small px-4 pt-4 text-text-weak">{copy.note}</p>
        </section>

        <section>
          <SectionHeader title="Contact info" topPad="pt-6" />
          <div className="t-small px-4 pt-4 text-text-strong">
            <p>{CONTACT.phone}</p>
            <p>{CONTACT.email}</p>
          </div>
          <p className="t-small px-4 pt-4 text-text-weak">
            Not your contact info? Call us at <CallLink />
          </p>
        </section>

        <div className={toastOpen ? "h-56" : "h-10"} />
        <div className="mt-auto">
          <PrototypeLabel />
        </div>
      </main>

      {toastOpen && (
        <Toast title="Your address is updated" onClose={() => setToastOpen(false)}>
          We’ll send a confirmation by text and email.
        </Toast>
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
