import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { AddressStoreProvider } from "@/lib/store";
import { ProtoControls } from "@/components/ProtoControls";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thrive Shipping Prototype",
  description: "Clickable prototype of Thrive Mobile member self-service for shipping. Mock data only.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* fontFamily/heading + fontFamily/body: variable General Sans, same file as enroll.thrivemobile.com. */}
        <link rel="preload" href="/fonts/GeneralSans-Variable.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <AddressStoreProvider>
          <div className="relative flex min-h-dvh w-full flex-col">
            {children}
          </div>
          <Suspense>
            <ProtoControls />
          </Suspense>
        </AddressStoreProvider>
      </body>
    </html>
  );
}
