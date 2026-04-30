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
import { useEffect, useRef, useState } from "react";

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

// Debug HUD step type
type DebugStep = {
  label: string;
  t: number;
  detail?: string;
};

function isDebugEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return new URLSearchParams(window.location.search).has("debug-intro");
}

export function PreloadIntro({
  src = "/images/hero.png",
  alt = "Hero",
  hold = 0,
  duration = 0.7,
}: Props) {
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);
  const [viewport, setViewport] = useState<{ vw: number; vh: number } | null>(
    null
  );
  const [target, setTarget] = useState<Rect | null>(null);
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
  // Render-time `debug` MUST match between SSR (false) and first client paint
  // (false). Flip it via post-mount effect so the HUD only mounts after
  // hydration is complete — no mismatch.
  const [debug, setDebug] = useState(false);
  useEffect(() => {
    if (isDebugEnabled()) {
      setDebug(true);
    }
  }, []);
  const t0Ref = useRef<number>(0);
  // logStep reads URL directly so logs always fire when ?debug-intro=1 is
  // set, even though `debug` state flips after the main useEffect runs.
  const logStep = (label: string, detail?: string) => {
    if (!isDebugEnabled()) {
      return;
    }
    const t = performance.now() - t0Ref.current;
    // biome-ignore lint/suspicious/noConsole: debug-only HUD
    console.log(`[intro] +${t.toFixed(0)}ms ${label}`, detail ?? "");
    setDebugSteps((prev) => [...prev, { label, t, detail }]);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    t0Ref.current = performance.now();
    logStep("mount", `src=${src}`);
    prefetchImages(PREFETCH_ASSETS);

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      logStep("skip:mobile");
      setSkip(true);
      return;
    }
    if (sessionStorage.getItem("jamb:intro-played")) {
      logStep("skip:replay");
      setSkip(true);
      return;
    }

    lockScroll();
    logStep("scroll-locked");
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    setViewport({ vw, vh });
    logStep("viewport-set", `${vw}×${vh}`);

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
    const measureStart = performance.now();
    const MEASURE_DEADLINE_MS = 3000;

    const measure = () => {
      if (cancelled) {
        return;
      }
      // Hard cap: if we can't measure within deadline (no hero element on
      // page, or hero hasn't laid out), bail out. Marks intro played and
      // unmounts so the user isn't stuck on a static overlay forever.
      if (performance.now() - measureStart > MEASURE_DEADLINE_MS) {
        logStep("measure:deadline-exceeded");
        sessionStorage.setItem("jamb:intro-played", "1");
        setDone(true);
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
      logStep(
        "measure:ok",
        `top=${r.top.toFixed(0)} left=${r.left.toFixed(0)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`
      );
      setTarget({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const decodeOverlayImage = async () => {
      const probe = new window.Image();
      probe.src = src;
      try {
        await probe.decode();
        logStep("decode:overlay-ok");
      } catch (e) {
        logStep("decode:overlay-fail", String(e));
      }
    };

    // Wait on hero img with a hard cap. We pre-decode the overlay image
    // (same URL as hero) so the hero element loads from cache anyway —
    // there's no value in blocking longer than ~1.5s on hero.complete.
    const waitForHeroWithTimeout = () =>
      new Promise<void>((resolve) => {
        let settled = false;
        const finish = (label: string) => {
          if (settled) {
            return;
          }
          settled = true;
          logStep(label);
          resolve();
        };
        const timer = setTimeout(() => finish("hero-img:timeout"), 1500);
        waitForHeroImage().then(() => {
          clearTimeout(timer);
          finish("hero-img:loaded");
        });
      });

    const kickoff = async () => {
      logStep("kickoff:start");
      await (document.fonts?.ready ?? Promise.resolve());
      logStep("fonts:ready");
      await decodeOverlayImage();
      await waitForHeroWithTimeout();
      requestAnimationFrame(() => requestAnimationFrame(measure));
    };

    // Don't wait for window.load — that fires after ALL resources finish,
    // including all prefetched images. fonts.ready + image decode inside
    // kickoff is enough. Start immediately.
    logStep(`readyState:${document.readyState}`);
    kickoff();

    return () => {
      cancelled = true;
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
    <>
      <motion.div
        animate={targetState}
        aria-hidden
        className="pointer-events-none fixed z-[70] overflow-hidden"
        data-preload-intro
        initial={initialState}
        onAnimationComplete={() => {
          logStep("animation:complete");
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
      {debug && (
        <div
          className="fixed top-2 left-2 z-[100] max-h-[80vh] w-[360px] overflow-y-auto rounded bg-black/85 p-3 font-mono text-[11px] text-white"
          style={{ pointerEvents: "auto" }}
        >
          <div className="mb-2 flex items-center justify-between border-b border-white/30 pb-2 font-bold">
            <span>preload-intro debug</span>
            <button
              className="rounded bg-white/20 px-2 py-0.5 hover:bg-white/30"
              onClick={() => {
                sessionStorage.removeItem("jamb:intro-played");
                window.location.reload();
              }}
              type="button"
            >
              reset
            </button>
          </div>
          <div className="mb-1">
            state: skip={String(skip)} done={String(done)} target=
            {target ? "set" : "null"} viewport={viewport ? "set" : "null"}
          </div>
          <div className="mb-1">
            target:{" "}
            {target
              ? `${target.top.toFixed(0)},${target.left.toFixed(0)} ${target.width.toFixed(0)}×${target.height.toFixed(0)}`
              : "—"}
          </div>
          <div className="mb-2 border-t border-white/20 pt-2">steps:</div>
          {debugSteps.map((s, i) => (
            <div className="leading-tight" key={`${i}-${s.label}`}>
              +{s.t.toFixed(0)}ms {s.label}
              {s.detail ? ` — ${s.detail}` : ""}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
