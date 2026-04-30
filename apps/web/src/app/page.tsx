// ============================================================================
// HOMEPAGE — Server Component at route `/`
// ============================================================================
// Responsibilities:
//   1. Fetch the homePage singleton from Sanity (contains a page builder array)
//   2. If empty → render a hardcoded <DemoHomepage/> fallback
//   3. If populated → render <PageBuilder/> which dispatches each block to
//      its matching React component
//   4. Render <PreloadIntro/> with the same hero image URL the hero element
//      will use so the browser cache hits when the overlay unmounts.
// ============================================================================

import { buildImageUrl } from "@workspace/sanity/image";
import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";
import { preload } from "react-dom";

import { DemoHomepage } from "@/components/demo-homepage";
import { PageBuilder } from "@/components/pagebuilder";
import { PreloadIntro } from "@/components/preload-intro";
import { getSEOMetadata } from "@/lib/seo";

// Wrapper so we can call the fetch from both generateMetadata and Page.
// Next.js dedupes identical fetches per request, so there's no double round-trip.
async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

// Runs on every request. Builds <title>, <meta>, OpenGraph, Twitter, canonical.
// Fields come straight from the Sanity document so authors control SEO.
export async function generateMetadata() {
  const { data: homePageData } = await fetchHomePageData();
  return getSEOMetadata({
    title: homePageData?.title ?? homePageData?.seoTitle ?? "Jamb",
    description:
      homePageData?.description ??
      homePageData?.seoDescription ??
      "Luxury homeware — fireplaces, lighting, and furniture.",
    slug: "/",
    contentId: homePageData?._id,
    contentType: homePageData?._type,
  });
}

// Resolve the hero image URL the hero element will actually render. Match the
// width/height passed by hero-section.tsx so the CDN serves the same variant
// → cache hit when overlay unmounts and hero takes over.
function getHeroImageUrl(
  pageBuilder: Array<{ _type: string } & Record<string, unknown>> | null
): string | null {
  if (!pageBuilder) {
    return null;
  }
  const heroBlock = pageBuilder.find((b) => b._type === "heroBlock") as
    | { image?: unknown }
    | undefined;
  if (!heroBlock?.image) {
    return null;
  }
  // biome-ignore lint/suspicious/noExplicitAny: query result image shape varies
  return buildImageUrl(heroBlock.image as any, { width: 2400, height: 1200 });
}

export default async function Page() {
  const { data: homePageData } = await fetchHomePageData();

  // Fallback path — no CMS document yet, or pageBuilder is empty.
  // Lets the site render offline during dev and before the reviewer seeds Sanity.
  if (!homePageData || !homePageData.pageBuilder?.length) {
    // Demo path uses static /images/hero.png — overlay default matches.
    return (
      <>
        <PreloadIntro />
        <DemoHomepage />
      </>
    );
  }

  // CMS-driven path. _id + _type are forwarded to PageBuilder so it can attach
  // Sanity data-sanity attributes → enables click-to-edit in Presentation tool.
  const { _id, _type, pageBuilder } = homePageData;

  // Compute the Sanity hero URL server-side and warm the browser cache via
  // react-dom preload(). Pass the same URL to PreloadIntro so the overlay
  // image and the hero element share one cached resource.
  const heroSrc = getHeroImageUrl(
    pageBuilder as Array<{ _type: string } & Record<string, unknown>> | null
  );
  if (heroSrc) {
    preload(heroSrc, { as: "image", fetchPriority: "high" });
  }

  return (
    <>
      <PreloadIntro src={heroSrc ?? undefined} />
      <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />
    </>
  );
}
