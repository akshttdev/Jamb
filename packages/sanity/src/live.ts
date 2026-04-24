// ============================================================================
// SANITY LIVE — reactive fetch + auto-revalidation
// ============================================================================
// `defineLive` wraps the standard client and returns:
//   - sanityFetch({ query })  → server-side data fetch (used in page.tsx)
//   - <SanityLive />          → client runtime that listens to mutations
//                               and revalidates matching queries automatically
//
// The two tokens:
//   - serverToken  → used by sanityFetch on the server for authenticated
//                    fetches (needed to pull drafts when draftMode is on).
//   - browserToken → sent to the browser ONLY inside a valid Next.js Draft
//                    Mode session, so drafts never leak to anonymous visitors.
// ============================================================================

import { env } from "@workspace/env/server";
import { defineLive } from "next-sanity/live";

import { client } from "./client";

export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: env.SANITY_API_READ_TOKEN,
  browserToken: env.SANITY_API_READ_TOKEN,
});
