import { SplitVerticalIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const splitBlock = defineType({
  name: "splitBlock",
  title: "Split",
  icon: SplitVerticalIcon,
  type: "object",
  description:
    "A two-column section with text on one side and an image on the other. Supports up to two call-to-action buttons.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description: "The heading for this section",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "Supporting text that provides detail about the topic or product",
      rows: 4,
    }),
    imageWithAltField({
      title: "Image",
      description: "The image displayed alongside the text content",
    }),
    defineField({
      name: "layout",
      type: "string",
      title: "Layout",
      description:
        "Which side the image appears on. 'Image Left' places the image left with text right, and vice versa.",
      options: {
        list: [
          { title: "Image Left", value: "left" },
          { title: "Image Right", value: "right" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "right",
    }),
    defineField({
      name: "anchorId",
      type: "string",
      title: "Anchor ID",
      description:
        "Optional anchor id for this section (e.g. 'fireplaces') so the hero anchor links can scroll to it",
    }),
    defineField({
      name: "ctas",
      type: "array",
      title: "Call-to-Action Buttons",
      description:
        "Up to two call-to-action buttons. The first uses the primary (outline) style; the second uses the link style.",
      of: [
        defineArrayMember({
          type: "object",
          name: "cta",
          title: "CTA",
          fields: [
            defineField({
              name: "label",
              type: "string",
              title: "Button Text",
              description: "The text on the button, e.g. 'Explore our Fireplaces'",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "url",
              type: "customUrl",
              title: "Link",
              description: "Where the button navigates to",
            }),
          ],
          preview: {
            select: {
              title: "label",
              external: "url.external",
              internal: "url.internal.slug.current",
              type: "url.type",
            },
            prepare: ({ title, external, internal, type }) => ({
              title: title || "Untitled CTA",
              subtitle: type === "external" ? external : internal,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
      layout: "layout",
    },
    prepare: ({ title, media, layout }) => ({
      title: title || "Untitled Split Block",
      subtitle: `Split — Image ${layout === "left" ? "Left" : "Right"}`,
      media,
    }),
  },
});
