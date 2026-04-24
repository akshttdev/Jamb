import Image from "next/image";
import Link from "next/link";

import type { Maybe, SanityImageProps } from "@/types";
import { SanityImage } from "./elements/sanity-image";

type LogoProps = {
  src?: Maybe<string>;
  image?: Maybe<SanityImageProps>;
  alt?: Maybe<string>;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function Logo({
  alt = "Jamb",
  image,
  width = 90,
  height = 28,
  priority = true,
}: LogoProps) {
  return (
    <Link
      aria-label={alt ?? "Jamb"}
      className="inline-flex items-center text-foreground"
      href="/"
    >
      {image ? (
        <SanityImage
          alt={alt ?? "logo"}
          className="h-auto w-[90px]"
          decoding="sync"
          image={image}
          loading="eager"
        />
      ) : (
        <Image
          alt={alt ?? "Jamb"}
          className="h-auto w-[90px]"
          decoding="sync"
          height={height}
          loading="eager"
          priority={priority}
          src="/images/navbar/jamb-logo.png"
          width={width}
        />
      )}
    </Link>
  );
}
