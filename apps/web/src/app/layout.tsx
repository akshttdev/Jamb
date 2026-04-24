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

const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");
  for (const href of HERO_ASSETS) {
    preload(href, { as: "image", fetchPriority: "high" });
  }
  const nav = await getNavigationData();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontJamb.variable} ${fontInter.variable} ${fontPolarisCondensed.variable} font-jamb antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('jamb:intro-played'))document.documentElement.classList.add('intro-skip');}catch(e){}",
          }}
        />
        <Providers>
          <Navbar navbarData={nav.navbarData} settingsData={nav.settingsData} />
          {children}
          <Suspense fallback={<FooterSkeleton />}>
            <FooterServer />
          </Suspense>
          <SanityLive />
          <CombinedJsonLd includeOrganization includeWebsite />
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
