// ============================================================================
// PRELOAD INTRO — FLIP shrink overlay on first tab visit (desktop only)
// ============================================================================
// Sequence:
//   1. SSR + first paint: full-viewport overlay covers page.
//   2. Wait for window load + fonts.ready + hero <img> decoded.
//   3. Measure hero rect. Animate top/left/width/height from viewport → rect.
//      Image inside (object-cover) re-crops with container so end-state aspect
//      matches hero exactly — no snap when overlay unmounts.
// ============================================================================
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
];

function prefetchImages(urls: readonly string[]) {
  for (const url of urls) {
    const img = new window.Image();
    img.decoding = "async";
    img.src = url;
  }
}

function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockScroll() {
  const sbw = getScrollbarWidth();
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  if (sbw > 0) {
    document.body.style.paddingRight = `${sbw}px`;
  }
  (window as unknown as { __jambIntroActive?: boolean }).__jambIntroActive =
    true;
  window.dispatchEvent(new CustomEvent("jamb:scroll-lock"));
}

function unlockScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  (window as unknown as { __jambIntroActive?: boolean }).__jambIntroActive =
    false;
  window.dispatchEvent(new CustomEvent("jamb:scroll-unlock"));
}

async function decodeImg(img: HTMLImageElement): Promise<void> {
  try {
    if ("decode" in img) {
      await img.decode();
    }
  } catch {
    // ignore
  }
}

function waitForHeroImage(): Promise<void> {
  return new Promise((resolve) => {
    const check = async () => {
      const heroImg = document.querySelector<HTMLImageElement>("#hero img");
      if (!heroImg) {
        requestAnimationFrame(check);
        return;
      }
      if (heroImg.complete && heroImg.naturalHeight > 0) {
        await decodeImg(heroImg);
        resolve();
        return;
      }
      const onDone = async () => {
        await decodeImg(heroImg);
        resolve();
      };
      heroImg.addEventListener("load", onDone, { once: true });
      heroImg.addEventListener("error", () => resolve(), { once: true });
    };
    check();
  });
}

type Rect = { top: number; left: number; width: number; height: number };

type Props = {
  src?: string;
  alt?: string;
  hold?: number;
  duration?: number;
};

export function PreloadIntro({
  src = "/images/hero.png",
  alt = "Hero",
  hold = 500,
  duration = 1.6,
}: Props) {
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const [viewport, setViewport] = useState<{ vw: number; vh: number } | null>(
    null
  );
  const [target, setTarget] = useState<Rect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    prefetchImages(PREFETCH_ASSETS);

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      setSkip(true);
      return;
    }
    if (sessionStorage.getItem("jamb:intro-played")) {
      setSkip(true);
      return;
    }

    lockScroll();
    setViewport({
      vw: document.documentElement.clientWidth,
      vh: document.documentElement.clientHeight,
    });

    const blockScroll = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      const blocked = [
        " ",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "PageUp",
        "PageDown",
        "Home",
        "End",
      ];
      if (blocked.includes(event.key)) {
        event.preventDefault();
      }
    };
    window.addEventListener("wheel", blockScroll, { passive: false });
    window.addEventListener("touchmove", blockScroll, { passive: false });
    window.addEventListener("keydown", blockKeys);

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
      setTarget({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const decodeOverlayImage = async () => {
      try {
        const probe = new window.Image();
        probe.src = src;
        if ("decode" in probe) {
          await probe.decode();
        } else {
          await new Promise<void>((resolve) => {
            probe.onload = () => resolve();
            probe.onerror = () => resolve();
          });
        }
      } catch {
        // ignore — proceed anyway
      }
    };

    const kickoff = async () => {
      await (document.fonts?.ready ?? Promise.resolve());
      await decodeOverlayImage();
      await waitForHeroImage();
      requestAnimationFrame(() => requestAnimationFrame(measure));
    };

    if (document.readyState === "complete") {
      kickoff();
    } else {
      window.addEventListener("load", kickoff, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", kickoff);
      window.removeEventListener("wheel", blockScroll);
      window.removeEventListener("touchmove", blockScroll);
      window.removeEventListener("keydown", blockKeys);
    };
  }, [src]);

  useEffect(() => {
    if (!(done || skip)) {
      return;
    }
    unlockScroll();
  }, [done, skip]);

  if (done || skip) {
    return null;
  }

  // Pre-viewport-measure render (covers SSR + first paint).
  // Plain div with `inset-0` covers viewport via top/right/bottom/left = 0,
  // no explicit width/height conflicts to worry about.
  if (!viewport) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
        data-preload-intro
      >
        <Image
          alt={alt}
          className="object-cover"
          draggable={false}
          fill
          priority
          sizes="100vw"
          src={src}
        />
      </div>
    );
  }

  const initialState = {
    top: 0,
    left: 0,
    width: viewport.vw,
    height: viewport.vh,
  };

  const targetState = target ?? initialState;
  const isShrinking = Boolean(target);

  return (
    <motion.div
      animate={targetState}
      aria-hidden
      className="pointer-events-none fixed z-[70] overflow-hidden"
      data-preload-intro
      initial={initialState}
      onAnimationComplete={() => {
        if (isShrinking) {
          sessionStorage.setItem("jamb:intro-played", "1");
          setDone(true);
        }
      }}
      style={{ willChange: "top, left, width, height" }}
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
        draggable={false}
        fill
        priority
        sizes="100vw"
        src={src}
      />
    </motion.div>
  );
}
