"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ErrorBanner, HavingTrouble, Modal } from "@/components/Feedback";
import { Input, Select } from "@/components/Field";
import { PageCard, PageShell } from "@/components/PageShell";
import { BodyCopy, FullScreenMessage, PageHeading, StickyFooter } from "@/components/Screen";
import {
  MOCK_DELAY_MS,
  US_STATES,
  formatAddressLines,
  matchSuggestions,
  memberByKey,
  recommendAddress,
  zipMatches,
  type Address,
  type Suggestion,
} from "@/lib/data";
import { useHref, useMode } from "@/lib/nav";
import { useAddressStore } from "@/lib/store";

const EMPTY: Address = { line1: "", line2: "", city: "", state: "", zip: "" };

/** Mock Google Places dropdown under the Address field. */
function Suggestions({
  query,
  items,
  onPick,
  onClose,
}: {
  query: string;
  items: Suggestion[];
  onPick: (s: Suggestion) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-x-16 top-full z-20 mt-8">
      <div className="overflow-hidden rounded-16 bg-background-raised shadow-overlay">
        <div className="flex items-center justify-between px-16 pt-16 pb-8">
          <p className="type-tiny-bold text-text-weak">Suggestions</p>
          <button type="button" onClick={onClose} aria-label="Close suggestions" className="-m-4 p-4">
            <img src="/figma/close.svg" alt="" width={24} height={24} />
          </button>
        </div>
        <ul role="listbox" aria-label="Address suggestions">
          {items.map((s) => {
            const label = `${s.line1}, ${s.city} ${s.state}, USA`;
            const typed = label.slice(0, query.trim().length);
            return (
              <li key={s.line1} role="option" aria-selected={false}>
                <button
                  type="button"
                  // Keep focus on the input until the pick lands.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onPick(s)}
                  className="type-small-regular block w-full truncate p-16 text-left hover:bg-fill-weaker"
                >
                  <span className="font-mid text-text-strong">{typed}</span>
                  <span className="font-weak text-text-weak">{label.slice(typed.length)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="type-tiny-bold bg-fill-weaker p-16 text-text-weak">Powered by Google</p>
      </div>
    </div>
  );
}

function AddressEdit() {
  const params = useSearchParams();
  const router = useRouter();
  const href = useHref();
  const mode = useMode();
  const { setAddress } = useAddressStore();
  const member = memberByKey(params.get("m"));
  const statusHref = href("/status", { m: member?.key ?? "" });

  const [form, setForm] = useState<Address>(EMPTY);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [zipError, setZipError] = useState<string>();
  const [saveFailed, setSaveFailed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Address changes only exist in FULL mode, and only before the order is prepared.
  const allowed = !!member && mode === "full" && member.status === "ordered";
  useEffect(() => {
    if (!allowed) router.replace(member ? statusHref : href("/lookup"));
  }, [allowed, member, statusHref, href, router]);
  if (!allowed || !member) return null;

  const suggestions = showSuggestions ? matchSuggestions(form.line1) : [];
  const complete = !!(form.line1.trim() && form.zip.trim() && form.city.trim() && form.state);
  const recommended = recommendAddress(form);

  const update = (key: keyof Address, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "zip" || key === "city" || key === "state") setZipError(undefined);
  };

  const pick = (s: Suggestion) => {
    setForm((f) => ({ ...f, line1: s.line1, city: s.city, state: s.state, zip: s.zip }));
    setZipError(undefined);
    setShowSuggestions(false);
  };

  const onUpdate = () => {
    setShowSuggestions(false);
    if (!zipMatches(form)) {
      setZipError("Please enter the correct zip code.");
      return;
    }
    setConfirming(true);
  };

  const save = (address: Address) => {
    setConfirming(false);
    setSaveFailed(false);
    setSaving(true);
    timer.current = setTimeout(() => {
      // Prototype hook: an address containing "ERROR" simulates a backend failure.
      if (/error/i.test(address.line1)) {
        setSaving(false);
        setSaveFailed(true);
        window.scrollTo({ top: 0 });
        return;
      }
      setAddress(member.key, { ...address, line1: address.line1.trim(), line2: address.line2.trim() });
      router.push(href("/status", { m: member.key, updated: "1" }));
    }, MOCK_DELAY_MS);
  };

  if (saving) {
    return (
      <PageShell backHref={statusHref}>
        <PageCard>
          <FullScreenMessage title="Updating your address..." body="This will only take a moment." />
        </PageCard>
      </PageShell>
    );
  }

  const [enteredStreet, enteredCity] = formatAddressLines({ ...form, line1: form.line1.trim() });
  const [recStreet, recCity] = formatAddressLines(recommended);

  return (
    <>
      <PageShell backHref={statusHref}>
        <PageCard backHref={statusHref}>
          <PageHeading title="Update your shipping address" topSpacer>
            <BodyCopy>We’ll send your phone to this address.</BodyCopy>
            <BodyCopy>Use a residential (home) address - no PO Boxes or business addresses.</BodyCopy>
          </PageHeading>

          {saveFailed && (
            <ErrorBanner title="Something went wrong">
              Your address wasn’t updated. Please call Thrive Support for assistance or try again.
            </ErrorBanner>
          )}

          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (complete) onUpdate();
            }}
          >
            <div className="relative">
              <Input
                label="Address"
                autoComplete="off"
                icon="/figma/search.svg"
                value={form.line1}
                role="combobox"
                aria-expanded={suggestions.length > 0}
                aria-autocomplete="list"
                onChange={(e) => {
                  update("line1", e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setShowSuggestions(false)}
                onKeyDown={(e) => e.key === "Escape" && setShowSuggestions(false)}
              />
              {suggestions.length > 0 && (
                <Suggestions query={form.line1} items={suggestions} onPick={pick} onClose={() => setShowSuggestions(false)} />
              )}
            </div>
            <Input
              label="Apt / Unit (optional)"
              autoComplete="address-line2"
              value={form.line2}
              onChange={(e) => update("line2", e.target.value)}
            />
            <Input
              label="ZIP code"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={form.zip}
              onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
              error={zipError}
            />
            <Input
              label="City"
              autoComplete="address-level2"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <Select label="State" options={US_STATES} value={form.state} onChange={(v) => update("state", v)} />
            <button type="submit" hidden aria-hidden tabIndex={-1} />
          </form>

          {(zipError || saveFailed) && <HavingTrouble />}

          <div className="h-24 web:hidden" />
          <StickyFooter>
            <Button onClick={onUpdate} disabled={!complete}>
              Update address
            </Button>
          </StickyFooter>
        </PageCard>
      </PageShell>

      <Modal
        open={confirming}
        icon="/figma/warning.svg"
        title="Confirm your new address"
        actions={
          <>
            <Button onClick={() => save(recommended)}>Use recommended</Button>
            <Button variant="secondary" onClick={() => save(form)}>
              Use your address
            </Button>
          </>
        }
      >
        <p className="type-small-regular px-16 pt-8 text-text-weak">
          We found a more precise address. Please review and confirm our recommended address below.
        </p>
        <div className="type-small-regular px-16 pt-16 text-text-weak">
          <p className="font-strong text-text-strong">You entered</p>
          <p>{enteredStreet}</p>
          <p>{enteredCity}</p>
        </div>
        <div className="type-small-regular px-16 pt-16 text-text-weak">
          <p className="font-strong text-text-strong">Recommended</p>
          <p>{recStreet}</p>
          <p>{recCity}</p>
        </div>
        <div className="h-16" />
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <AddressEdit />
    </Suspense>
  );
}
