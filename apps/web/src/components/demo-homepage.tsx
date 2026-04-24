"use client";

import Image from "next/image";

import { MotionWrapper } from "./ui/motion-wrapper";

const ANCHOR_LINKS = [
  { label: "Fireplaces", href: "#fireplaces" },
  { label: "Lighting", href: "#lighting" },
  { label: "Furniture", href: "#furniture" },
  { label: "Journal", href: "#journal" },
];

const CHIMNEYPIECES = [1, 2, 3, 4].map(() => ({
  name: "Lorem Ipsum",
  subtitle: "Subtitle",
  src: "/images/chimneypiece-1.png",
  width: 333,
  height: 244,
}));

const LIGHTING = [1, 2, 3, 4, 5].map(() => ({
  name: "Lorem Ipsum",
  subtitle: "Subtitle",
  src: "/images/lighting-product-1.png",
  width: 186,
  height: 253,
}));

const FURNITURE = [
  {
    name: "Lorem Ipsum",
    subtitle: "Subtitle",
    src: "/images/chair.png",
    width: 189,
    height: 253,
  },
  {
    name: "Lorem Ipsum",
    subtitle: "Subtitle",
    src: "/images/story-1.png",
    width: 233,
    height: 187,
  },
  {
    name: "Lorem Ipsum",
    subtitle: "Subtitle",
    src: "/images/story-2.png",
    width: 233,
    height: 186,
  },
  {
    name: "Lorem Ipsum",
    subtitle: "Subtitle",
    src: "/images/story-3.png",
    width: 232,
    height: 232,
  },
  {
    name: "Lorem Ipsum",
    subtitle: "Subtitle",
    src: "/images/story-4.png",
    width: 232,
    height: 152,
  },
];

const STORIES = [1, 2, 3, 4, 5].map(() => ({
  name: "Lorem Ipsum",
  subtitle: "Subtitle",
  src: "/images/journal.png",
}));

const LOREM =
  "Lorem ipsum dolor sit amet, incididunt ut labore et dolore consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim labore et dolore magn ad minim veniam.";

function AnchorNav() {
  return (
    <nav
      aria-label="Page sections"
      className="mx-auto flex max-w-6xl flex-nowrap items-center justify-center whitespace-nowrap px-4 py-6 text-sm text-[#9C9C9D] md:py-8 md:text-base"
    >
      {ANCHOR_LINKS.map((link, index) => (
        <span className="flex items-center whitespace-nowrap" key={link.href}>
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
  );
}

function OutlineCta({ label }: { label: string }) {
  return (
    <span className="cta-transition inline-flex items-center justify-center border border-[#737373] px-10 py-1.5 text-base text-[#737373] hover:border-black hover:bg-black hover:text-white">
      {label}
    </span>
  );
}

type SplitProps = {
  id: string;
  title: string;
  description: string;
  imgSrc: string;
  imgAlt: string;
  ctas: string[];
};

function Split({ id, title, description, imgSrc, imgAlt, ctas }: SplitProps) {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:py-28" id={id}>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1 lg:pl-0 lg:pr-16 xl:pr-24">
          <div className="mx-auto flex max-w-[520px] flex-col gap-5 lg:-ml-5 lg:mx-0">
            <h2 className="text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
              {title}
            </h2>
            <p className="text-left text-base font-medium tracking-normal leading-[25px] text-black">
              {description}
            </p>
            {ctas.length > 0 && (
              <div className="mt-3 flex flex-col items-center justify-center gap-3 self-center">
                {ctas.map((cta) => (
                  <OutlineCta key={cta} label={cta} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[583/734] w-full max-w-[583px] overflow-hidden">
            <Image
              alt={imgAlt}
              className="object-cover"
              fill
              sizes="(min-width: 1024px) 583px, 100vw"
              src={imgSrc}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type GridItem = {
  name: string;
  subtitle: string;
  src: string;
  width?: number;
  height?: number;
};

type GridProps = {
  title: string;
  columns: 3 | 4 | 5;
  aspectClass?: string;
  dark?: boolean;
  muted?: boolean;
  items: GridItem[];
  id?: string;
  imageScale?: number;
};

const COLUMN_CLASS: Record<3 | 4 | 5, string> = {
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
};

function ProductGrid({
  title,
  columns,
  aspectClass,
  dark,
  muted,
  items,
  id,
  imageScale,
}: GridProps) {
  const scaleStyle = imageScale
    ? { width: `${imageScale * 100}%` }
    : undefined;
  return (
    <section
      className={`w-full px-4 pt-[30px] pb-[44px] sm:px-6 md:px-10 md:pb-[60px] lg:px-12 ${
        muted ? "bg-surface-muted" : ""
      }`}
      id={id}
    >
      <div className="mx-auto max-w-[1400px]">
        <MotionWrapper>
          <h2 className="mb-10 text-center text-[21px] font-[550] tracking-tight leading-[18px] md:mb-12">
            {title}
          </h2>
        </MotionWrapper>

        <div
          className={`grid items-stretch gap-x-5 gap-y-10 ${COLUMN_CLASS[columns]}`}
        >
          {items.map((item, index) => {
            const hasNaturalSize = Boolean(item.width && item.height);
            return (
              <div
                className="group flex h-full flex-col items-center text-center"
                key={`${item.src}-${index}`}
              >
                  <div className="flex w-full flex-1 items-center justify-center">
                    {hasNaturalSize && dark ? (
                      <div
                        className="relative w-full overflow-hidden bg-[#111]"
                        style={{
                          aspectRatio: `${item.width} / ${item.height}`,
                        }}
                      >
                        <Image
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                          src={item.src}
                        />
                      </div>
                    ) : hasNaturalSize ? (
                      <div
                        className="relative mx-auto w-full overflow-hidden"
                        style={{
                          aspectRatio: `${item.width} / ${item.height}`,
                          ...scaleStyle,
                        }}
                      >
                        <Image
                          alt={item.name}
                          className="object-cover"
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                          src={item.src}
                        />
                      </div>
                    ) : (
                      <div
                        className={`${aspectClass ?? "aspect-[4/3]"} relative mx-auto w-full overflow-hidden ${
                          dark ? "bg-[#111]" : ""
                        }`}
                        style={scaleStyle}
                      >
                        <Image
                          alt={item.name}
                          className={
                            dark ? "object-contain p-4" : "object-cover"
                          }
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
                          src={item.src}
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-0.5 text-center">
                    <h3 className="text-base font-bold text-[#737373] leading-[25px]">
                      {item.name}
                    </h3>
                    <p className="text-base font-medium text-[#737373] leading-[25px]">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Editorial() {
  return (
    <section
      className="bg-[#DFDAD7] px-6 pt-0 pb-16 md:px-12 md:pt-[17px] md:pb-24 lg:pt-[33px] lg:pb-28"
      id="journal"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-center text-[16px] uppercase font-medium text-foreground">
            JOURNAL
          </p>
          <h2 className="text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
            The Grand Collection
          </h2>
          <p className="mx-auto max-w-[450px] text-left text-base font-medium tracking-normal leading-[25px] text-black">
            {LOREM}
          </p>
          <div className="mt-3 flex justify-center">
            <OutlineCta label="Discover more" />
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            alt="Grand collection editorial"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={"/images/furniture-2.png"}
          />
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="px-6 py-16 md:px-12 md:py-24 lg:py-28" id="newsletter">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-5">
          <h2 className="mx-auto max-w-[340px] text-balance text-center text-[34px] font-medium leading-tight tracking-tight text-black">
            Subscribe to the Jamb Journal
          </h2>
          <p className="mx-auto max-w-[450px] text-left text-base font-medium tracking-normal leading-[25px] text-black">
            {LOREM}
          </p>
          <div className="mt-3 flex justify-center">
            <OutlineCta label="Discover more" />
          </div>
        </div>

        <div className="relative mx-auto aspect-[3/4] w-full max-w-[520px] overflow-hidden">
          <Image
            alt="Jamb Journal magazine cover"
            className="object-cover"
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            src={"/images/furniture-3.png"}
          />
        </div>
      </div>
    </section>
  );
}

export function DemoHomepage() {
  return (
    <main>
      <section className="w-full px-[38px]" id="hero">
        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[1436/768]">
          <Image
            alt="Jamb hero"
            className="object-cover"
            fill
            priority
            sizes="(min-width: 1436px) 1436px, 100vw"
            src={"/images/hero.png"}
          />
        </div>
        <AnchorNav />
      </section>

      <Split
        ctas={["Explore our Fireplaces", "Sell an Antique Chimneypiece"]}
        description={LOREM}
        id="fireplaces"
        imgAlt="Fireplace interior"
        imgSrc={"/images/fireplace.png"}
        title="Fireplaces"
      />

      <Split
        ctas={["Explore our Lighting"]}
        description={LOREM}
        id="lighting"
        imgAlt="Lighting interior"
        imgSrc={"/images/lighting.png"}
        title="Lighting"
      />

      <ProductGrid
        columns={4}
        dark
        items={CHIMNEYPIECES}
        muted
        title="Our latest chimneypieces"
      />

      <ProductGrid
        columns={5}
        dark
        items={LIGHTING}
        muted
        title="Our latest lighting"
      />

      <Split
        ctas={["Explore our Furniture"]}
        description={LOREM}
        id="furniture"
        imgAlt="Furniture"
        imgSrc={"/images/furniture-1.png"}
        title="Furniture"
      />

      <ProductGrid
        columns={5}
        imageScale={0.8}
        items={FURNITURE}
        muted
        title="Our latest furniture"
      />

      <Editorial />

      <ProductGrid
        aspectClass="aspect-[245/316]"
        columns={5}
        imageScale={0.75}
        items={STORIES}
        muted
        title="See more of our latest stories"
      />

      <Newsletter />
    </main>
  );
}
