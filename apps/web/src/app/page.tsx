import { sanityFetch } from "@workspace/sanity/live";
import { queryHomePageData } from "@workspace/sanity/query";

import { DemoHomepage } from "@/components/demo-homepage";
import { PageBuilder } from "@/components/pagebuilder";
import { PreloadIntro } from "@/components/preload-intro";
import { getSEOMetadata } from "@/lib/seo";

async function fetchHomePageData() {
  return await sanityFetch({
    query: queryHomePageData,
  });
}

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

  if (!homePageData || !homePageData.pageBuilder?.length) {
    return (
      <>
        <PreloadIntro />
        <DemoHomepage />
      </>
    );
  }

  const { _id, _type, pageBuilder } = homePageData;

  return (
    <>
      <PreloadIntro />
      <PageBuilder id={_id} pageBuilder={pageBuilder ?? []} type={_type} />
    </>
  );
}
