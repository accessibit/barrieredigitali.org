import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";

import { RouteFocus } from "@/components/layout/RouteFocus";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE, SITE_URL } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Segnalazioni — ${SITE.name}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Le barriere del web, segnalate da chi le incontra. Cerca tra le segnalazioni di siti, app e documenti digitali inaccessibili, o inviane una.",
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, locale: "it_IT", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={inter.variable}>
      <body>
        <div className="@container relative min-h-dvh">
          <a
            href="#contenuto"
            className="absolute -top-16 left-4 z-10 rounded-md bg-ink px-4 py-3 font-semibold text-white no-underline hover:text-white focus:top-2"
          >
            Vai al contenuto
          </a>
          <SiteHeader />
          <main id="contenuto" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <Suspense fallback={null}>
            <RouteFocus />
          </Suspense>
        </div>
      </body>
    </html>
  );
}
