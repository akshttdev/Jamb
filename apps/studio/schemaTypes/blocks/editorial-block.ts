// Editorial block schema — eyebrow + heading + body + image + CTA.
// Used for the "Journal — The Grand Collection" feature row.
// Matches sections/editorial-section.tsx via `_type === "editorialBlock"`.

import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const editorialBlock = defineType({
  name: "editorialBlock",
  title: "Editorial",
  icon: DocumentTextIcon,
  type: "object",
  description:
    "An editorial section with an eyebrow label, title, description, image, and call-to-action. Perfect for highlighting a story or feature (e.g. Journal).",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      title: "Eyebrow",
      description:
        "A short label displayed above the title in small caps, e.g. 'JOURNAL'",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The heading for this editorial section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description: "The body text that tells the story or describes the topic",
      rows: 4,
    }),
    imageWithAltField({
      title: "Image",
      description: "A supporting image for the editorial content",
    }),
    defineField({
      name: "anchorId",
      type: "string",
      title: "Anchor ID",
      description:
        "Optional anchor id (e.g. 'journal') so hero anchor links can scroll to it",
    }),
    defineField({
      name: "ctaLabel",
      type: "string",
      title: "Call to Action Text",
      description:
        "Optional button text like 'Discover more' or 'Read the Journal'",
    }),
    defineField({
      name: "ctaUrl",
      type: "customUrl",
      title: "Call to Action Link",
      description: "Where the call-to-action button navigates to",
      hidden: ({ parent }) => !parent?.ctaLabel,
    }),
  ],
  preview: {
    select: {
      title: "title",
      eyebrow: "eyebrow",
      media: "image",
    },
    prepare: ({ title, eyebrow, media }) => ({
      title: title || "Untitled Editorial",
      subtitle: eyebrow ? `${eyebrow} · Editorial` : "Editorial Block",
      media,
    }),
  },
});
