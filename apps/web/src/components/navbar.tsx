"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import type { NavigationData } from "@/types";
import { Logo } from "./logo";

const fetcher = async (url: string): Promise<NavigationData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch navigation data");
  }
  return response.json();
};

const NAVBAR_ICONS = [
  {
    src: "/images/navbar/icons/icon-2.png",
    alt: "Search",
    href: "#search",
    width: 32,
    height: 23,
  },
  {
    src: "/images/navbar/icons/icon-1.png",
    alt: "Contact",
    href: "#contact",
    width: 24,
    height: 26,
  },
  {
    src: "/images/navbar/icons/icon-3.png",
    alt: "Menu",
    href: "#menu",
    width: 31,
    height: 21,
  },
];

export function Navbar({
  navbarData: initialNavbarData,
  settingsData: initialSettingsData,
}: NavigationData) {
  const { data } = useSWR<NavigationData>("/api/navigation", fetcher, {
    fallbackData: {
      navbarData: initialNavbarData,
      settingsData: initialSettingsData,
    },
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: true,
    refreshInterval: 30_000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  const settingsData = data?.settingsData ?? initialSettingsData;
  const { logo, siteTitle } = settingsData ?? {};

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="flex h-16 items-center justify-between px-6 md:h-20 md:px-10">
        <Logo alt={siteTitle ?? "Jamb"} image={logo} />

        <nav aria-label="Utility" className="flex items-center gap-6 md:gap-7">
          {NAVBAR_ICONS.map((icon) => (
            <Link
              aria-label={icon.alt}
              className="cta-transition inline-flex items-center justify-center opacity-80 hover:opacity-100"
              href={icon.href}
              key={icon.src}
            >
              <Image
                alt={icon.alt}
                className="object-contain"
                height={icon.height}
                src={icon.src}
                style={{ width: icon.width, height: icon.height }}
                width={icon.width}
              />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
