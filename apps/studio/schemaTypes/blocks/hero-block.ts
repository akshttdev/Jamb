// Hero block schema — full-bleed image + optional anchor-link row beneath it.
// Matches sections/hero-section.tsx via `_type === "heroBlock"`.

import { ImageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const heroBlock = defineType({
  name: "heroBlock",
  title: "Hero",
  icon: ImageIcon,
  type: "object",
  description:
    "A full-width hero image, with an optional row of anchor links below for in-page navigation (e.g. Fireplaces | Lighting | Furniture | Journal).",
  fields: [
    imageWithAltField({
      title: "Hero Image",
      description:
        "A high-quality, full-width image that sets the tone for the page. Landscape orientation recommended.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "anchorLinks",
      type: "array",
      title: "Anchor Links",
      description:
        "Optional row of in-page navigation links displayed below the hero image (e.g. Fireplaces, Lighting, Furniture, Journal)",
      of: [
        defineArrayMember({
          type: "object",
          name: "anchorLink",
          title: "Anchor Link",
          fields: [
            defineField({
              name: "label",
              type: "string",
              title: "Label",
              description: "The text displayed for this link",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "href",
              type: "string",
              title: "Link",
              description:
                "Anchor target (e.g. #fireplaces) or relative path (e.g. /journal)",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
      validation: (Rule) => Rule.max(6),
    }),
  ],
  preview: {
    select: {
      media: "image",
      links: "anchorLinks",
    },
    prepare: ({ media, links }) => ({
      title: "Hero",
      subtitle: `Full-width hero${links?.length ? ` · ${links.length} anchor link${links.length === 1 ? "" : "s"}` : ""}`,
      media,
    }),
  },
});
