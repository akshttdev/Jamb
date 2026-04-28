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

function getHeroRealImg(): HTMLImageElement | null {
  // sanity-image library renders two <img>: the LQIP (with data-lqip="true",
  // base64 inline so .complete fires instantly) and the real one (no
  // data-lqip). Skip the LQIP — wait for the actual high-res image to load.
  const imgs = document.querySelectorAll<HTMLImageElement>("#hero img");
  for (const img of imgs) {
    if (!img.hasAttribute("data-lqip")) {
      return img;
    }
  }
  // Demo path uses Next/Image directly — only one img, no LQIP.
  return imgs[0] ?? null;
}

function waitForHeroImage(): Promise<void> {
  return new Promise((resolve) => {
    const check = async () => {
      const heroImg = getHeroRealImg();
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
      const probe = new window.Image();
      probe.src = src;
      try {
        await probe.decode();
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

  // Single motion.div from first render through animation end.
  // - Pre-viewport / pre-target: full-viewport via vw/vh OR pixel numbers.
  // - Image stays mounted throughout, no remount → no re-decode blur.
  // - Animation kicks in only when `target` is set (transition: duration 0
  //   for non-shrinking renders so width/height swaps from vw/vh→px snap).
  const initialState = {
    top: 0,
    left: 0,
    width: viewport ? viewport.vw : "100vw",
    height: viewport ? viewport.vh : "100vh",
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
