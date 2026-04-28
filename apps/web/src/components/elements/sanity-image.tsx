"use client";
import {
  processImageData,
  SANITY_BASE_URL,
  type SanityImageProps,
} from "@workspace/sanity/image";
import { type ElementType, memo } from "react";
import {
  SanityImage as BaseSanityImage,
  type WrapperProps,
} from "sanity-image";

// Image wrapper component
const ImageWrapper = <T extends ElementType = "img">(
  props: WrapperProps<T>
) => <BaseSanityImage baseUrl={SANITY_BASE_URL} {...props} />;

type ExtraProps = { disablePreview?: boolean };

// Main component
function SanityImageUnmemorized({
  image,
  disablePreview,
  ...props
}: SanityImageProps & ExtraProps) {
  const processedImageData = processImageData(image);

  // Early return for invalid image data
  if (!processedImageData) {
    return null;
  }

  // Strip the LQIP preview so sanity-image renders a single <img> with
  // src/srcset directly instead of the LQIP wrapper. Skips the blur preview
  // entirely — caller is expected to load the real image with priority.
  const data = disablePreview
    ? { ...processedImageData, preview: undefined }
    : processedImageData;

  return <ImageWrapper {...props} {...data} />;
}

export const SanityImage = memo(SanityImageUnmemorized);
