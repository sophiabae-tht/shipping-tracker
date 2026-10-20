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

// This screen stands in for the www.thrivemobile.com homepage: everything except "Order Status"
// (the entry point to this prototype) links to the live site.
const SITE = "https://www.thrivemobile.com";

function FooterLink({ children, href }: { children: React.ReactNode; href?: string }) {
  const cls = "type-tiny-regular block px-16 pt-12 text-text-inverse-strong";
  if (!href) return <span className={cls}>{children}</span>;
  if (href.startsWith("http")) {
    return (
      <a href={href} className={`${cls} underline-offset-2 hover:underline`}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${cls} underline-offset-2 hover:underline`}>
      {children}
    </Link>
  );
}

function FooterHeader({ children }: { children: React.ReactNode }) {
  return <p className="type-tiny-bold px-16 pb-16 text-text-inverse-strong">{children}</p>;
}

function FooterSubHeader({ children }: { children: React.ReactNode }) {
  return <p className="type-tiny-regular px-16 pt-12 text-text-inverse-weak underline">{children}</p>;
}

function EntryHome() {
  const href = useHref();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="relative isolate flex flex-1 flex-col overflow-hidden bg-background-sunken">
      <Header />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img src="/figma/gradient-green.svg" alt="" className="absolute -right-[389px] top-[221px] h-[779px] w-[779px] max-w-none" />
        <img src="/figma/gradient-blue.svg" alt="" className="absolute -left-[377px] top-[347px] h-[779px] w-[779px] max-w-none" />
      </div>

      <section className="mx-auto w-full max-w-[752px] px-16 pt-64" aria-label="Frequently asked questions">
        <div className="px-16 pt-16">
          {FAQS.map((q, i) => (
            <Accordion key={q} title={q} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? null : i)}>
              <p className="type-small-regular pb-16 text-text-weak">Placeholder answer for the prototype.</p>
            </Accordion>
          ))}
        </div>
      </section>

      <div className="h-128" />

      <footer className="bg-illo-brand-mid p-32">
        <div className="mx-auto flex w-full max-w-[576px] flex-col lg:max-w-[1040px]">
          <div className="flex items-start justify-between pt-16">
            <a href={SITE} className="px-16">
              <img src="/figma/logo-symbol-white.svg" alt="Thrive Mobile" width={38} height={38} />
            </a>
            <div className="flex items-center gap-16 px-16">
              <a href={SUPPORT_PHONE_TEL} aria-label="Call Thrive Mobile">
                <img src="/figma/phone.svg" alt="" width={24} height={24} />
              </a>
              <img src="/figma/envelope.svg" alt="" width={24} height={24} />
              <a href="https://www.facebook.com/profile.php?id=61570914966892" aria-label="Thrive Mobile on Facebook">
                <img src="/figma/facebook.svg" alt="" width={24} height={24} />
              </a>
              <a href="https://www.linkedin.com/company/thrive-mobile-co/" aria-label="Thrive Mobile on LinkedIn">
                <img src="/figma/linkedin.svg" alt="" width={24} height={24} />
              </a>
            </div>
          </div>
          <div className="h-32" />
          <nav className="flex flex-col gap-48 py-16 md:grid md:grid-cols-3 md:gap-32" aria-label="Footer">
            <div>
              <FooterHeader>Product</FooterHeader>
              <FooterLink href={`${SITE}/plans`}>Wireless plans</FooterLink>
              <FooterLink href={`${SITE}/coverage`}>Network Coverage</FooterLink>
              <FooterLink href={`${SITE}/faq`}>FAQ</FooterLink>
              <FooterLink href={href("/lookup")}>Order Status</FooterLink>
            </div>
            <div>
              <FooterHeader>Partners</FooterHeader>
              <FooterSubHeader>States</FooterSubHeader>
              <FooterLink>Louisiana Department of Health</FooterLink>
              <div className="h-12" />
              <FooterSubHeader>Health plans</FooterSubHeader>
              <FooterLink>Aetna</FooterLink>
              <FooterLink>Gold Kidney</FooterLink>
              <FooterLink>Denver Health</FooterLink>
              <div className="h-12" />
              <FooterSubHeader>Providers</FooterSubHeader>
              <FooterLink>FQHCs</FooterLink>
            </div>
            <div>
              <FooterHeader>Legal</FooterHeader>
              <FooterLink href={`${SITE}/policy/privacy-policy`}>Privacy Policy</FooterLink>
              <FooterLink href={`${SITE}/policy/terms-conditions`}>Terms &amp; Conditions</FooterLink>
              <FooterLink href={`${SITE}/policy/transparency-policy`}>Transparency Policy</FooterLink>
              <FooterLink href={`${SITE}/policy/accessibility-policy`}>Accessibility Policy</FooterLink>
            </div>
          </nav>
          <div className="h-32" />
          <p className="type-tiny-regular px-16 pb-16 text-text-inverse-weak">
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
