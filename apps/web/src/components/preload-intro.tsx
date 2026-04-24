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

    const measureHero = () => {
      const heroInner = document.querySelector<HTMLElement>("#hero > div");
      if (!heroInner) {
        return;
      }
      const r = heroInner.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    const raf = requestAnimationFrame(measureHero);

    return () => {
      cancelAnimationFrame(raf);
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
