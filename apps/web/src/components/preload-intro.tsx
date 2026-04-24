// ============================================================================
// PRELOAD INTRO — FLIP animation on first tab visit
// ============================================================================
// On first visit in a tab:
//   1. Covers the screen with the hero image (full viewport)
//   2. Waits for every above-the-fold resource to finish loading
//      (window.load + document.fonts.ready) BEFORE measuring the hero.
//      This is the key to eliminating jitter — without it the hero's final
//      position is a moving target as images/fonts paint in.
//   3. Measures the real hero's bounding rect (retries if hero not yet sized).
//   4. Holds for `hold` ms, then shrinks to the measured rect over `duration` s.
//   5. Once the animation completes, sets sessionStorage flag + unmounts.
//
// The `sessionStorage` key "jamb:intro-played" gates this to once-per-tab.
// A pre-hydration script in layout.tsx reads the same key to add .intro-skip
// on <html> before React mounts, so the overlay never flashes on reload.
//
// Why FLIP with layout props (top/left/width/height) instead of transforms:
// transforms leave layout alone → the animated element's final box position
// can be sub-pixel off from the real hero. Layout-property animation forces
// the overlay to occupy the hero's exact pixel region at the end.
// ============================================================================
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useLayoutEffect, useState } from "react";

const PREFETCH_ASSETS = [
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

function prefetchImages(urls: readonly string[]) {
  for (const url of urls) {
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type PreloadIntroProps = {
  src?: string;
  alt?: string;
  hold?: number;
  duration?: number;
};

export function PreloadIntro({
  src = "/images/hero.png",
  alt = "Jamb hero",
  hold = 500,
  duration = 1.6,
}: PreloadIntroProps) {
  const [done, setDone] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState<{ vw: number; vh: number } | null>(
    null
  );

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    prefetchImages(PREFETCH_ASSETS);

    if (sessionStorage.getItem("jamb:intro-played")) {
      setDone(true);
      return;
    }

    document.body.style.overflow = "hidden";
    setViewport({ vw: window.innerWidth, vh: window.innerHeight });

    let cancelled = false;

    const measure = () => {
      if (cancelled) {
        return;
      }
      const heroInner = document.querySelector<HTMLElement>("#hero > div");
      if (!heroInner) {
        requestAnimationFrame(measure);
        return;
      }
      const r = heroInner.getBoundingClientRect();
      if (r.height < 50) {
        requestAnimationFrame(measure);
        return;
      }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const kickoff = () => {
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      fontsReady.then(() => {
        requestAnimationFrame(() => requestAnimationFrame(measure));
      });
    };

    if (document.readyState === "complete") {
      kickoff();
    } else {
      window.addEventListener("load", kickoff, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", kickoff);
    };
  }, []);

  useEffect(() => {
    if (!done) {
      return;
    }
    document.body.style.overflow = "";
  }, [done]);

  if (done) {
    return null;
  }

  const initialState = viewport
    ? { top: 0, left: 0, width: viewport.vw, height: viewport.vh }
    : { top: 0, left: 0, width: "100vw", height: "100vh" };

  const targetState = rect
    ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    : initialState;

  const isShrinking = Boolean(rect && viewport);

  return (
    <motion.div
      animate={targetState}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
      data-preload-intro
      initial={initialState}
      onAnimationComplete={() => {
        if (isShrinking) {
          sessionStorage.setItem("jamb:intro-played", "1");
          setDone(true);
        }
      }}
      style={{
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
      transition={
        isShrinking
          ? {
              duration,
              delay: hold / 1000,
              ease: [0.77, 0, 0.175, 1],
            }
          : { duration: 0 }
      }
    >
      <Image
        alt={alt}
        className="object-cover"
        fill
        priority
        sizes="100vw"
        src={src}
      />
    </motion.div>
  );
}
