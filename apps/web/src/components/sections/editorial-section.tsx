"use client";

import Link from "next/link";

import type { PagebuilderType } from "@/types";
import { SanityImage } from "../elements/sanity-image";

type EditorialSectionProps = PagebuilderType<"editorialBlock">;

export function EditorialSection({
  eyebrow,
  title,
  description,
  image,
  ctaLabel,
  ctaHref,
  openInNewTab,
  anchorId,
}: EditorialSectionProps) {
  return (
    <section
      className="bg-[#DFDAD7] px-6 pt-0 pb-16 md:px-12 md:pt-[17px] md:pb-24 lg:pt-[33px] lg:pb-28"
      id={anchorId ?? undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="flex flex-col justify-center gap-5">
            {eyebrow && (
              <p className="text-center text-[0.7rem] uppercase tracking-[0.22em] text-foreground/60">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-[450px] text-left text-base font-medium tracking-normal leading-[25px] text-black">
                {description}
              </p>
            )}
            {ctaLabel && (
              <div className="mt-3 flex justify-center">
                {ctaHref ? (
                  <Link
                    className="cta-transition inline-flex items-center justify-center border border-[#737373] px-10 py-1.5 text-base text-[#737373] hover:border-black hover:bg-black hover:text-white"
                    href={ctaHref}
                    target={openInNewTab ? "_blank" : undefined}
                  >
                    {ctaLabel}
                  </Link>
                ) : (
                  <span className="inline-flex cursor-not-allowed items-center justify-center border border-[#737373]/50 px-10 py-1.5 text-base text-[#737373]/60">
                    {ctaLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {image && (
          <div className="aspect-[4/5] overflow-hidden">
            <SanityImage
              className="h-full w-full rounded-none object-cover"
              height={1000}
              image={image}
              width={800}
            />
          </div>
        )}
      </div>
    </section>
  );
}
