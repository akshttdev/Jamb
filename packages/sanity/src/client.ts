// ============================================================================
// SANITY CLIENT — constructed once, shared across the workspace
// ============================================================================
// Used by `sanityFetch` (live.ts), GROQ queries, and the image URL builder.
//
// Key flags:
//   - perspective: "published" → only published docs render in prod. Drafts
//     only show when a user opens the Presentation tool (draft-mode session).
//   - useCdn: false in dev for always-fresh content, true in prod for global
//     edge caching (cheaper, faster).
//   - stega: embeds invisible metadata in strings during preview so the
//     Presentation tool can show inline edit buttons next to any text.
// ============================================================================

import type { SanityImageSource } from "@sanity/asset-utils";
import { createImageUrlBuilder } from "@sanity/image-url";
import { env } from "@workspace/env/client";
import { createClient } from "next-sanity";

export const client = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: env.NODE_ENV === "production",
  perspective: "published",
  stega: {
    studioUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    enabled: env.NEXT_PUBLIC_VERCEL_ENV === "preview",
  },
});

// Image URL builder — generates CDN URLs with on-the-fly transforms.
// `auto("format")` lets Sanity pick AVIF/WebP/JPEG based on browser support.
const imageBuilder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

export const urlFor = (source: SanityImageSource) =>
  imageBuilder.image(source).auto("format").quality(80).format("webp");
