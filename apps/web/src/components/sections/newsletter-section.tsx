"use client";

import type { PagebuilderType } from "@/types";
import { SanityImage } from "../elements/sanity-image";

type NewsletterSectionProps = PagebuilderType<"newsletterBlock">;

export function NewsletterSection({
  title,
  description,
  image,
  buttonText = "Discover more",
  anchorId,
}: NewsletterSectionProps) {
  return (
    <section
      className="px-6 py-16 md:px-12 md:py-24 lg:py-28"
      id={anchorId ?? undefined}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-5">
            {title && (
              <h2 className="mx-auto max-w-[340px] text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-[450px] text-left text-base font-medium tracking-normal leading-[25px] text-black">
                {description}
              </p>
            )}
            <div className="mt-3 flex justify-center">
              <span className="cta-transition inline-flex items-center justify-center border border-[#737373] px-10 py-1.5 text-base text-[#737373] hover:border-black hover:bg-black hover:text-white">
                {buttonText}
              </span>
            </div>
        </div>

        {image && (
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden">
            <SanityImage
              className="h-full w-full rounded-none object-cover"
              height={900}
              image={image}
              width={720}
            />
          </div>
        )}
      </div>
    </section>
  );
}
