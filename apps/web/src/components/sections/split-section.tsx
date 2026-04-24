"use client";

import Link from "next/link";

import type { PagebuilderType } from "@/types";
import { SanityImage } from "../elements/sanity-image";
import { MotionWrapper } from "../ui/motion-wrapper";

type SplitSectionProps = PagebuilderType<"splitBlock">;

export function SplitSection({
  title,
  description,
  image,
  layout = "right",
  anchorId,
  ctas,
}: SplitSectionProps) {
  const isImageLeft = layout === "left";

  return (
    <section
      className="px-6 py-16 md:px-12 md:py-24 lg:py-28"
      id={anchorId ?? undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <MotionWrapper
          className={isImageLeft ? "order-1" : "order-1 lg:order-2"}
        >
          {image && (
            <div className="mx-auto aspect-[583/734] w-full max-w-[583px] overflow-hidden">
              <SanityImage
                className="h-full w-full rounded-none object-cover"
                height={734}
                image={image}
                width={583}
              />
            </div>
          )}
        </MotionWrapper>

        <MotionWrapper
          className={
            isImageLeft
              ? "order-2 lg:pl-16 xl:pl-24"
              : "order-2 lg:order-1 lg:pl-0 lg:pr-16 xl:pr-24"
          }
          delay={0.12}
        >
          <div className="mx-auto flex max-w-[520px] flex-col gap-5 lg:-ml-5 lg:mx-0">
            {title && (
              <h2 className="text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-left text-base font-medium tracking-normal leading-[25px] text-black">
                {description}
              </p>
            )}
            {ctas && ctas.length > 0 && (
              <div className="mt-3 flex flex-col items-center justify-center gap-3 self-center">
                {ctas.map((cta) =>
                  cta.href ? (
                    <Link
                      className="cta-transition inline-flex items-center justify-center border border-[#737373] px-10 py-1.5 text-base text-[#737373] hover:border-black hover:bg-black hover:text-white"
                      href={cta.href}
                      key={cta._key}
                      target={cta.openInNewTab ? "_blank" : undefined}
                    >
                      {cta.label}
                    </Link>
                  ) : (
                    <span
                      className="inline-flex cursor-not-allowed items-center justify-center border border-[#737373]/50 px-10 py-1.5 text-base text-[#737373]/60"
                      key={cta._key}
                    >
                      {cta.label}
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}
