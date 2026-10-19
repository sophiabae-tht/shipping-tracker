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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <AddressStoreProvider>
          <div className="relative mx-auto flex min-h-dvh w-full max-w-[420px] flex-col bg-bg-base">
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
