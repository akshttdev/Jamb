"use client";

import Link from "next/link";

import type { PagebuilderType } from "@/types";
import { SanityImage } from "../elements/sanity-image";
import { MotionWrapper } from "../ui/motion-wrapper";

type ProductGridSectionProps = PagebuilderType<"productGridBlock">;

const ASPECT_RATIO_CLASS: Record<
  NonNullable<ProductGridSectionProps["aspectRatio"]>,
  string
> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  tall: "aspect-[2/3]",
  "extra-tall": "aspect-[1/2]",
  landscape: "aspect-[4/3]",
  wide: "aspect-video",
};

const COLUMN_CLASS: Record<3 | 4 | 5, string> = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
};

const IMAGE_BACKGROUND_CLASS: Record<
  NonNullable<ProductGridSectionProps["imageBackground"]>,
  string
> = {
  none: "",
  dark: "bg-[#111] text-white",
  light: "bg-white",
};

export function ProductGridSection({
  title,
  products,
  aspectRatio = "portrait",
  columns = 4,
  imageBackground = "none",
  sectionBackground = "default",
  anchorId,
}: ProductGridSectionProps) {
  if (!products || products.length === 0) {
    return null;
  }

  const aspectClass = ASPECT_RATIO_CLASS[aspectRatio];
  const columnClass = COLUMN_CLASS[columns];
  const backgroundClass = IMAGE_BACKGROUND_CLASS[imageBackground];
  const sectionBgClass =
    sectionBackground === "muted" ? "bg-surface-muted" : "";

  return (
    <section
      className={`w-full px-4 pt-[30px] pb-[44px] sm:px-6 md:px-10 md:pb-[60px] lg:px-12 ${sectionBgClass}`}
      id={anchorId ?? undefined}
    >
      <div className="mx-auto max-w-[1400px]">
        {title && (
          <MotionWrapper>
            <h2 className="mb-10 text-center text-[21px] font-[550] tracking-tight leading-[18px] md:mb-12">
              {title}
            </h2>
          </MotionWrapper>
        )}

        <div className={`grid items-stretch gap-x-5 gap-y-10 ${columnClass}`}>
          {products.map((product) => {
            const CardInner = (
              <div className="group flex h-full flex-col">
                {product.image && (
                  <div
                    className={`${aspectClass} ${backgroundClass} relative flex w-full flex-1 items-center justify-center overflow-hidden`}
                  >
                    <SanityImage
                      className="h-auto w-auto max-w-full rounded-none object-contain"
                      height={1200}
                      image={product.image}
                      width={900}
                    />
                  </div>
                )}
                <div className="mt-4 space-y-0.5 text-center">
                  <h3 className="text-base font-bold text-[#737373] leading-[25px]">
                    {product.name}
                  </h3>
                  {product.subtitle && (
                    <p className="text-base font-medium text-[#737373] leading-[25px]">
                      {product.subtitle}
                    </p>
                  )}
                </div>
              </div>
            );

            return product.href ? (
              <Link
                aria-label={product.name}
                className="block"
                href={product.href}
                key={product._key}
                target={product.openInNewTab ? "_blank" : undefined}
              >
                {CardInner}
              </Link>
            ) : (
              <div key={product._key}>{CardInner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
