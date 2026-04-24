// ============================================================================
// HOMEPAGE — Server Component at route `/`
// ============================================================================
// Responsibilities:
//   1. Fetch the homePage singleton from Sanity (contains a page builder array)
//   2. If empty → render a hardcoded <DemoHomepage/> fallback
//   3. If populated → render <PageBuilder/> which dispatches each block to
//      its matching React component
//   4. Always render <PreloadIntro/> (first-visit FLIP animation)
// ============================================================================

import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";

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

export default async function Page() {
  const { data: homePageData } = await fetchHomePageData();

  // Fallback path — no CMS document yet, or pageBuilder is empty.
  // Lets the site render offline during dev and before the reviewer seeds Sanity.
  if (!homePageData || !homePageData.pageBuilder?.length) {
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

  return (
    <>
      <PreloadIntro />
      <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />
    </>
  );
}
