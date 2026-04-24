"use client";

import Link from "next/link";

type ColumnSection = {
  heading: string;
  items: string[];
};

type FooterColumn = {
  key: string;
  sections: ColumnSection[];
  extra?: { heading: string }[];
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    key: "chimneypieces",
    sections: [
      {
        heading: "Reproduction Chimneypieces",
        items: [
          "Marble",
          "Stone",
          "Grates & Accessories",
          "Guide to Jamb Marbles",
        ],
      },
      {
        heading: "Antique Chimneypieces",
        items: ["French & Italian", "Georgian", "Regency"],
      },
    ],
    extra: [{ heading: "Sell an Antique Chimneypiece" }],
  },
  {
    key: "lighting",
    sections: [
      {
        heading: "Reproduction Lighting",
        items: [
          "Hanging Globes",
          "Hanging Lanterns",
          "Wall Lights",
          "Dish Lights",
          "Table Lamps",
          "Chains & Brackets",
        ],
      },
    ],
  },
  {
    key: "furniture",
    sections: [
      {
        heading: "Reproduction Furniture",
        items: ["Seating", "Tables", "Mirrors", "The Pantry Collection"],
      },
      {
        heading: "Antique Furniture",
        items: [
          "Seating",
          "Tables",
          "Desks",
          "Bookcases & Cabinets",
          "Chests",
          "Mirrors",
          "Fire Accessories",
          "Objects",
          "Works of Arts",
          "Lighting",
        ],
      },
    ],
  },
  {
    key: "journal",
    sections: [
      {
        heading: "Journal",
        items: [
          "Praesentium",
          "Voluptatibus",
          "Accusamus",
          "Iusto",
          "Dignissimos",
        ],
      },
    ],
  },
  {
    key: "about",
    sections: [
      {
        heading: "About",
        items: [
          "Founders",
          "Team",
          "History",
          "Galleries",
          "Workshops",
          "Showrooms",
          "Terms & Conditions",
        ],
      },
    ],
  },
];

function ColumnLinks({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item}>
          <Link
            className="cta-transition text-[15px] text-[#9C9C9D] hover:text-black"
            href="#"
          >
            {item}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ColumnHeading({ label }: { label: string }) {
  return (
    <div className="border-t border-[#9C9C9D] pt-4">
      <h3 className="mb-4 font-semibold text-[15px] text-black">{label}</h3>
    </div>
  );
}

function JambFooter() {
  return (
    <footer className="mt-10 w-full bg-[#E3E3E3] px-6 pt-16 pb-12 md:px-10 lg:px-14">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 lg:grid-cols-5">
          <div className="text-[15px] text-[#9C9C9D] leading-relaxed">
            <p>Tel: +44 (0) 207 730 2122</p>
            <p>95-97 Pimlico Rd</p>
            <p>London SW1W 8PH</p>
          </div>
          <div className="text-[15px] text-[#9C9C9D]">
            <a
              className="cta-transition hover:text-black"
              href="mailto:hello@jamb.co.uk"
            >
              hello@jamb.co.uk
            </a>
          </div>
          <div className="hidden lg:block" />
          <div className="col-span-1 md:col-span-3 lg:col-span-2">
            <p className="mb-3 font-semibold text-[15px] text-[#9C9C9D]">
              Newsletter
            </p>
            <form
              className="flex w-full gap-1"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                className="w-full bg-white px-4 py-3 font-[family-name:var(--font-polaris-condensed)] text-[15px] text-black placeholder:text-[#9C9C9D] focus:outline-none"
                placeholder="Search"
                type="email"
              />
              <button
                className="cta-transition bg-white px-6 text-[15px] text-[#9C9C9D] hover:text-black"
                type="submit"
              >
                Subscribe
              </button>
            </form>
            <label className="mt-3 flex items-center gap-2 text-[14px] text-[#9C9C9D]">
              <input
                className="h-3.5 w-3.5 appearance-none rounded-full border border-[#9C9C9D] bg-transparent checked:bg-black"
                type="checkbox"
              />
              <span>I agree to our Privacy Policy</span>
            </label>
          </div>
        </div>

        <div className="mt-10 mb-10 grid grid-cols-1 gap-x-8 gap-y-10 pt-4 md:grid-cols-3 lg:grid-cols-5">
          {FOOTER_COLUMNS.map((column) => (
            <div className="flex flex-col gap-6" key={column.key}>
              {column.sections.map((section) => (
                <div key={section.heading}>
                  <ColumnHeading label={section.heading} />
                  <ColumnLinks items={section.items} />
                </div>
              ))}
              {column.extra?.map((row) => (
                <ColumnHeading key={row.heading} label={row.heading} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function FooterServer() {
  return <JambFooter />;
}

export function FooterSkeleton() {
  return <JambFooter />;
}
