"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { Accordion } from "@/components/Accordion";
import { Header } from "@/components/Header";
import { PrototypeLabel } from "@/components/Screen";
import { SUPPORT_PHONE_TEL } from "@/lib/data";
import { useHref } from "@/lib/nav";

const FAQS = [
  "What if I need assistance with enrollment?",
  "How long does it take to sign up?",
  "Does Thrive Mobile have good coverage in my area?",
  "Are there any hidden fees?",
  "Can I bring my number?",
  "Do I need to sign up for a long-term contract?",
  "What happens if I run out of data?",
  "How do I access local resources and offers?",
  "How do I apply for Lifeline?",
];

function FooterLink({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls = "t-tiny block px-4 pt-3 text-text-inverse";
  return href ? (
    <Link href={href} className={`${cls} underline-offset-2 hover:underline`}>
      {children}
    </Link>
  ) : (
    <span className={cls}>{children}</span>
  );
}

function FooterHeader({ children }: { children: React.ReactNode }) {
  return <p className="t-tiny-bold px-4 pb-4 text-text-inverse">{children}</p>;
}

function FooterSubHeader({ children }: { children: React.ReactNode }) {
  return <p className="t-tiny px-4 pt-3 text-text-inverse-weak underline">{children}</p>;
}

function EntryHome() {
  const href = useHref();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden bg-bg-sunken">
      <Header />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img src="/figma/gradient-green.svg" alt="" className="absolute -right-[389px] top-[221px] h-[779px] w-[779px] max-w-none" />
        <img src="/figma/gradient-blue.svg" alt="" className="absolute -left-[377px] top-[347px] h-[779px] w-[779px] max-w-none" />
      </div>

      <section className="px-4 pt-16" aria-label="Frequently asked questions">
        <div className="px-4 pt-4">
          {FAQS.map((q, i) => (
            <Accordion key={q} title={q} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)}>
              <p className="t-small pb-4 text-text-weak">Placeholder answer for the prototype.</p>
            </Accordion>
          ))}
        </div>
      </section>

      <div className="h-32" />

      <footer className="bg-illo-brandmid p-8">
        <div className="mx-auto flex max-w-[576px] flex-col">
          <div className="flex items-start justify-between pt-4">
            <div className="px-4">
              <img src="/figma/logo-symbol-white.svg" alt="Thrive Mobile" width={38} height={38} />
            </div>
            <div className="flex items-center gap-4 px-4">
              <a href={SUPPORT_PHONE_TEL} aria-label="Call Thrive Mobile">
                <img src="/figma/phone.svg" alt="" width={24} height={24} />
              </a>
              <img src="/figma/envelope.svg" alt="" width={24} height={24} />
              <img src="/figma/facebook.svg" alt="" width={24} height={24} />
              <img src="/figma/linkedin.svg" alt="" width={24} height={24} />
            </div>
          </div>
          <div className="h-8" />
          <nav className="flex flex-col gap-12 py-4" aria-label="Footer">
            <div>
              <FooterHeader>Product</FooterHeader>
              <FooterLink>Wireless plans</FooterLink>
              <FooterLink>Network Coverage</FooterLink>
              <FooterLink>FAQ</FooterLink>
              <FooterLink href={href("/lookup")}>Order Status</FooterLink>
            </div>
            <div>
              <FooterHeader>Partners</FooterHeader>
              <FooterSubHeader>States</FooterSubHeader>
              <FooterLink>Louisiana Department of Health</FooterLink>
              <div className="h-3" />
              <FooterSubHeader>Health plans</FooterSubHeader>
              <FooterLink>Aetna</FooterLink>
              <FooterLink>Gold Kidney</FooterLink>
              <FooterLink>Denver Health</FooterLink>
              <div className="h-3" />
              <FooterSubHeader>Providers</FooterSubHeader>
              <FooterLink>FQHCs</FooterLink>
            </div>
            <div>
              <FooterHeader>Legal</FooterHeader>
              <FooterLink>Privacy Policy</FooterLink>
              <FooterLink>Terms &amp; Conditions</FooterLink>
              <FooterLink>Transparency Policy</FooterLink>
              <FooterLink>Accessibility Policy</FooterLink>
            </div>
          </nav>
          <div className="h-8" />
          <p className="t-tiny px-4 pb-4 text-text-inverse-weak">
            © 2025 Thrive Health Tech, Inc.
            <br />
            All rights reserved.
          </p>
          <PrototypeLabel inverse />
        </div>
      </footer>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <EntryHome />
    </Suspense>
  );
}
