import { EnvelopeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const newsletterBlock = defineType({
  name: "newsletterBlock",
  title: "Newsletter",
  icon: EnvelopeIcon,
  type: "object",
  description:
    "A newsletter signup section with an image, heading, description, email input, and subscribe button.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Title",
      description:
        "The heading for the newsletter section, e.g. 'Subscribe to the Jamb Journal'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
      description:
        "A short message encouraging visitors to subscribe to your newsletter",
      rows: 3,
    }),
    imageWithAltField({
      title: "Image",
      description: "An image displayed alongside the newsletter form (e.g. magazine cover)",
    }),
    defineField({
      name: "placeholder",
      type: "string",
      title: "Email Placeholder",
      description:
        "The placeholder text shown in the email input before the visitor types",
      initialValue: "Email address",
    }),
    defineField({
      name: "buttonText",
      type: "string",
      title: "Button Text",
      description: "The text on the subscribe button, e.g. 'Subscribe'",
      initialValue: "Subscribe",
    }),
    defineField({
      name: "anchorId",
      type: "string",
      title: "Anchor ID",
      description:
        "Optional anchor id (e.g. 'newsletter') so hero anchor links can scroll to it",
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "image",
    },
    prepare: ({ title, media }) => ({
      title: title || "Newsletter",
      subtitle: "Newsletter Signup Block",
      media,
    }),
  },
});
