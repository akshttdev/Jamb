import type { PagebuilderType } from "@/types";
import { SanityImage } from "../elements/sanity-image";

type HeroSectionProps = PagebuilderType<"heroBlock">;

export function HeroSection({ image, anchorLinks }: HeroSectionProps) {
  if (!image) {
    return null;
  }

  return (
    <section className="w-full px-[38px]" id="hero">
      <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[1436/768]">
        <SanityImage
          className="h-full w-full rounded-none object-cover"
          fetchPriority="high"
          height={1200}
          image={image}
          loading="eager"
          width={2400}
        />
      </div>
      {anchorLinks && anchorLinks.length > 0 && (
        <nav
          aria-label="Page sections"
          className="mx-auto flex max-w-6xl flex-nowrap items-center justify-center whitespace-nowrap px-4 py-6 text-sm text-[#9C9C9D] md:py-8 md:text-base"
        >
          {anchorLinks.map((link, index) => (
            <span
              className="flex items-center whitespace-nowrap"
              key={link._key}
            >
              {index > 0 && (
                <span aria-hidden className="mx-2 text-[#9C9C9D]/50 md:mx-3">
                  |
                </span>
              )}
              <a
                className="cta-transition hover:text-black"
                href={link.href}
              >
                {link.label}
              </a>
            </span>
          ))}
        </nav>
      )}
    </section>
  );
}
