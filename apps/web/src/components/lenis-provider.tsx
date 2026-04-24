// ============================================================================
// LENIS PROVIDER — smooth scroll runtime
// ============================================================================
// Mounts Lenis on the client, drives its rAF loop, and hijacks anchor clicks
// so `<a href="#fireplaces">` animates over 1.8s instead of snapping.
//
// Why hijack instead of using Lenis defaults? We want the wheel scroll to feel
// native (default Lenis settings) but anchor-link jumps to feel cinematic.
// Hijacking lets us tune those two experiences independently.
//
// Respects prefers-reduced-motion → no-ops entirely on users who opted out.
// Renders null; exists purely for its side-effects.
// ============================================================================
"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function LenisProvider() {
  useEffect(() => {
    // Accessibility: users who prefer reduced motion get native scrolling.
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    // Default Lenis (lerp=0.1, wheelMultiplier=1). No custom config — the
    // default wheel feel was what the user asked for after iteration.
    const lenis = new Lenis();

    // Lenis is rAF-driven; we own the loop so we can cancel it on cleanup.
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Delegated click handler — catches all anchor clicks in the app without
    // having to attach listeners to every <a>. Closest() walks up the DOM
    // so clicks on nested text/icons still match.
    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      // Custom ease: 1 - (1-t)^4 = easeOutQuart (fast start, slow finish).
      // 1.8s duration = slow enough to feel deliberate without dragging.
      const scrollOptions = {
        duration: 1.8,
        easing: (t: number) => 1 - (1 - t) ** 4,
      };

      // Case 1: in-page anchor like #fireplaces
      if (href.startsWith("#")) {
        if (href === "#") {
          // Placeholder hrefs — let the browser do its thing (no-op).
          return;
        }
        const target = document.querySelector(href);
        if (!target) {
          return;
        }
        event.preventDefault();
        // Offset of -80 so the target's top isn't hidden under the navbar.
        lenis.scrollTo(target as HTMLElement, {
          ...scrollOptions,
          offset: -80,
        });
        return;
      }

      // Case 2: clicking "home" (href="/") while already on "/" → scroll to top.
      // Skips a full page reload and gives the user a smooth return-to-top.
      if (href === "/" && window.location.pathname === "/") {
        event.preventDefault();
        lenis.scrollTo(0, scrollOptions);
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
