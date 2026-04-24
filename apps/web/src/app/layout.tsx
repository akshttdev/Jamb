// ============================================================================
// ROOT LAYOUT — wraps every page in the Next.js App Router
// ============================================================================
// Loads global styles, fonts, navbar, footer, Sanity live-preview runtime.
// This is a Server Component (note the `async`) so we can fetch navigation
// data on the server before hydration.
// ============================================================================

import "@workspace/ui/globals.css";
import "lenis/dist/lenis.css";

import { SanityLive } from "@workspace/sanity/live";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { preconnect, prefetchDNS, preload } from "react-dom";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { Navbar } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { Providers } from "@/components/providers";
import { getNavigationData } from "@/lib/navigation";

// Google-hosted Inter — used for the footer search input (condensed sans).
// `variable` exposes a CSS var so Tailwind can reference it as font-[family-name:var(--font-inter)].
const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Local Copernicus family — 4 weights. This is the brand body/display font.
// Supplied as public/fonts/*.woff & .ttf because the Figma font is paid and
// not available on Google Fonts (see README — "figma font workaround").
const fontJamb = localFont({
  src: [
    {
      path: "../../public/fonts/GalaxieCopernicus-Book.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Copernicus-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Copernicus-Semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/Copernicus-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-jamb",
  display: "swap",
  preload: true,
});

// Narrow condensed font — used only for the footer search placeholder.
// Loaded separately so we don't bloat the critical font payload.
const fontPolarisCondensed = localFont({
  src: [
    {
      path: "../../public/fonts/GalaxiePolarisCondensed-Light.otf",
      weight: "300",
      style: "normal",
    },
  ],
  variable: "--font-polaris-condensed",
  display: "swap",
});

// Assets warmed on first request. react-dom's preload() injects
// <link rel="preload" as="image"> tags into <head> so the browser
// fetches them in parallel with the HTML — big win for LCP.
const HERO_ASSETS = [
  "/images/hero.png",
  "/images/fireplace.png",
  "/images/lighting.png",
  "/images/chimneypiece-1.png",
  "/images/lighting-product-1.png",
  "/images/furniture-1.png",
  "/images/furniture-2.png",
  "/images/furniture-3.png",
  "/images/story-1.png",
  "/images/story-2.png",
  "/images/story-3.png",
  "/images/story-4.png",
  "/images/journal.png",
  "/images/navbar/jamb-logo.png",
  "/images/navbar/icons/icon-1.png",
  "/images/navbar/icons/icon-2.png",
  "/images/navbar/icons/icon-3.png",
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Open a TCP+TLS handshake to Sanity CDN before we need it. Shaves ~100ms
  // off the first image fetch.
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");

  // Queue every critical image for parallel download during HTML streaming.
  for (const href of HERO_ASSETS) {
    preload(href, { as: "image", fetchPriority: "high" });
  }

  // Navbar is CMS-editable — fetched server-side so it renders with HTML.
  const nav = await getNavigationData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontJamb.variable} ${fontInter.variable} ${fontPolarisCondensed.variable} font-jamb antialiased`}
      >
        {/*
         * Pre-hydration script. Runs before React mounts.
         * Checks sessionStorage: if the preload intro already played in this
         * tab, adds .intro-skip to <html> so CSS can hide the overlay BEFORE
         * first paint — prevents the "flash of intro" on reload.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('jamb:intro-played'))document.documentElement.classList.add('intro-skip');}catch(e){}",
          }}
        />
        <Providers>
          <Navbar navbarData={nav.navbarData} settingsData={nav.settingsData} />
          {children}
          {/* Footer streams in via Suspense so the rest of the page isn't blocked. */}
          <Suspense fallback={<FooterSkeleton />}>
            <FooterServer />
          </Suspense>
          {/* SanityLive subscribes to content mutations; used by Presentation tool for live preview. */}
          <SanityLive />
          <CombinedJsonLd includeOrganization includeWebsite />
          {/* Draft mode = Sanity preview. Shows edit toolbar + preview banner. */}
          {(await draftMode()).isEnabled && (
            <>
              <PreviewBar />
              <VisualEditing />
            </>
          )}
        </Providers>
      </body>
    </html>
  );
}
