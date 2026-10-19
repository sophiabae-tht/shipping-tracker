"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ErrorBanner, HavingTrouble, InfoCard, Modal } from "@/components/Feedback";
import { Input, Select } from "@/components/Field";
import { Header } from "@/components/Header";
import { BodyCopy, FullScreenMessage, PageHeading, StickyFooter } from "@/components/Screen";
import {
  MOCK_DELAY_MS,
  SUPPORT_PHONE_TEL,
  findMember,
  formatLongDate,
  isValidDob,
  maskDob,
} from "@/lib/data";
import { useHref } from "@/lib/nav";

const HEALTH_PLANS = ["Humana", "Molina"];

type Form = { firstName: string; lastName: string; plan: string; memberId: string; dob: string };
type Errors = Partial<Record<keyof Form, string>>;

const EMPTY: Form = { firstName: "", lastName: "", plan: "", memberId: "", dob: "" };

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.plan) errors.plan = "Select your health plan.";
  if (!/^[A-Za-z0-9]{6,12}$/.test(form.memberId.trim())) errors.memberId = "Enter the member ID on your ID card.";
  if (!isValidDob(form.dob)) errors.dob = "Enter your date of birth (mm/dd/yyyy).";
  return errors;
}

function Lookup() {
  const router = useRouter();
  const href = useHref();
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [notFound, setNotFound] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const complete = Object.values(form).every((v) => v.trim().length > 0);

  const update = (key: keyof Form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Validate a field when the member leaves it, but only once they've typed something,
  // except the plan select, which they can skip past.
  const blurCheck = (key: keyof Form) => {
    if (key !== "plan" && !form[key]) return;
    const fieldError = validate(form)[key];
    if (fieldError) setErrors((e) => ({ ...e, [key]: fieldError }));
  };

  const onNext = () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setConfirming(true);
  };

  const onConfirm = () => {
    setConfirming(false);
    setNotFound(false);
    setLoading(true);
    timer.current = setTimeout(() => {
      const member = findMember(form.lastName, form.memberId, form.dob);
      if (member) {
        router.push(href("/status", { m: member.key }));
      } else {
        setLoading(false);
        setNotFound(true);
        window.scrollTo({ top: 0 });
      }
    }, MOCK_DELAY_MS);
  };

  if (loading) {
    return (
      <>
        <Header backHref={href("/")} />
        <FullScreenMessage title="Getting your order details..." body="This will only take a moment." />
      </>
    );
  }

  return (
    <>
      <Header backHref={href("/")} />
      <main className="flex flex-1 flex-col">
        <PageHeading title="Check on your Thrive phone" topSpacer>
          <BodyCopy>Enter your details to find your order and confirm your shipping address.</BodyCopy>
        </PageHeading>

        {notFound && (
          <ErrorBanner title="Something went wrong">
            Please verify that the information entered matches your {form.plan || "health plan"} ID card and try again.
          </ErrorBanner>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (complete) onNext();
          }}
        >
          <Input
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
          <Input
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
            hint="The legal name you use on official documents, like your Social Security Card or State ID."
          />
          <Select
            label="Health plan"
            options={HEALTH_PLANS}
            value={form.plan}
            onChange={(v) => update("plan", v)}
            onBlur={() => blurCheck("plan")}
            error={errors.plan}
          />
          <Input
            label="Member ID"
            autoCapitalize="characters"
            value={form.memberId}
            onChange={(e) => update("memberId", e.target.value.toUpperCase())}
            onBlur={() => blurCheck("memberId")}
            error={errors.memberId}
            hint={errors.memberId ? undefined : "Check the front of your member ID card."}
          />
          <Input
            label="Date of birth (mm/dd/yyyy)"
            inputMode="numeric"
            autoComplete="bday"
            icon="/figma/calendar.svg"
            value={form.dob}
            onChange={(e) => update("dob", maskDob(e.target.value))}
            onBlur={() => blurCheck("dob")}
            error={errors.dob}
          />
          {/* Lets Enter submit from any field. */}
          <button type="submit" hidden aria-hidden tabIndex={-1} />
        </form>

        {notFound ? (
          <HavingTrouble />
        ) : (
          <InfoCard icon="/figma/shield-check.svg" title="Why do we need this?">
            We use it to confirm eligibility with your health plan. Your data is encrypted and secure.
          </InfoCard>
        )}

        <div className="h-6" />
        <StickyFooter>
          <Button onClick={onNext} disabled={!complete}>
            Next
          </Button>
          {complete && (
            <Button variant="secondary" icon="/figma/headset.svg" href={SUPPORT_PHONE_TEL}>
              I can&apos;t find my member ID
            </Button>
          )}
        </StickyFooter>
      </main>

      <Modal
        open={confirming}
        icon="/figma/calendar-brand.svg"
        title="Just confirming — is this your birthday?"
        actions={
          <>
            <Button onClick={onConfirm}>Yes, that’s correct</Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Go back to edit
            </Button>
          </>
        }
      >
        {confirming && <p className="t-h4 px-4 pt-2 text-text-weak">{formatLongDate(form.dob)}</p>}
      </Modal>
    </>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Lookup />
    </Suspense>
  );
}
