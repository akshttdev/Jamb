import { ThLargeIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

import { imageWithAltField } from "@/schemaTypes/common";

export const productGridBlock = defineType({
  name: "productGridBlock",
  title: "Product Grid",
  icon: ThLargeIcon,
  type: "object",
  description:
    "A grid of products with images, names, and subtitles. Supports multiple aspect ratios and column counts so it works for chimneypieces, lighting, furniture, and editorial stories.",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Section Title",
      description: "The heading above the product grid (e.g. 'Our latest chimneypieces')",
    }),
    defineField({
      name: "anchorId",
      type: "string",
      title: "Anchor ID",
      description:
        "Optional anchor id for this section (e.g. 'lighting') so hero anchor links can scroll to it",
    }),
    defineField({
      name: "aspectRatio",
      type: "string",
      title: "Image Aspect Ratio",
      description:
        "Controls the shape of every product image in this grid. Pick the ratio that best suits the products (e.g. 'Tall' for lighting, 'Portrait' for furniture).",
      options: {
        list: [
          { title: "Square (1:1)", value: "square" },
          { title: "Portrait (3:4)", value: "portrait" },
          { title: "Tall (2:3)", value: "tall" },
          { title: "Extra Tall (1:2)", value: "extra-tall" },
          { title: "Landscape (4:3)", value: "landscape" },
          { title: "Wide (16:9)", value: "wide" },
        ],
        layout: "dropdown",
      },
      initialValue: "portrait",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "columns",
      type: "number",
      title: "Columns",
      description:
        "Number of columns on desktop. Mobile and tablet scale down automatically.",
      options: {
        list: [
          { title: "3 columns", value: 3 },
          { title: "4 columns", value: 4 },
          { title: "5 columns", value: 5 },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: 4,
      validation: (Rule) => Rule.required().min(3).max(5),
    }),
    defineField({
      name: "sectionBackground",
      type: "string",
      title: "Section Background",
      description:
        "Background colour behind the entire section. 'Muted' applies a soft grey panel (e.g. for 'Our latest chimneypieces', 'Our latest lighting', 'Our latest stories'); 'Default' uses the page background.",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "default",
    }),
    defineField({
      name: "imageBackground",
      type: "string",
      title: "Image Background",
      description:
        "Optional background colour behind the product images. Useful when product photos have transparent or dark backgrounds (e.g. dark background for lighting).",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "Dark", value: "dark" },
          { title: "Light", value: "light" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "none",
    }),
    defineField({
      name: "products",
      type: "array",
      title: "Products",
      description: "Add the products to display in the grid",
      of: [
        defineArrayMember({
          type: "object",
          name: "product",
          title: "Product",
          fields: [
            imageWithAltField({
              title: "Product Image",
              description: "A photo of the product",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "name",
              type: "string",
              title: "Product Name",
              description: "The name of the product",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "subtitle",
              type: "string",
              title: "Subtitle",
              description:
                "A short descriptor like product category, reference number, or price",
            }),
            defineField({
              name: "url",
              type: "customUrl",
              title: "Link",
              description: "Optional link to a detail page for this product",
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "subtitle",
              media: "image",
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      products: "products",
      columns: "columns",
      aspectRatio: "aspectRatio",
    },
    prepare: ({ title, products, columns, aspectRatio }) => ({
      title: title || "Product Grid",
      subtitle: `${products?.length ?? 0} product${products?.length === 1 ? "" : "s"} · ${columns ?? 4} cols · ${aspectRatio ?? "portrait"}`,
    }),
  },
});
