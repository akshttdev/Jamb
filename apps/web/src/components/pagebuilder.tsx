// ============================================================================
// PAGE BUILDER — the core of the CMS-driven homepage
// ============================================================================
// Receives an array of blocks (already shaped by GROQ) and renders each one
// by looking up its `_type` in BLOCK_COMPONENTS. This is the only place that
// knows how to map a block type string to a React component.
//
// Also handles two Presentation-tool concerns:
//   1. useOptimistic → shows unsaved edits from the studio in real time
//   2. data-sanity attributes → makes each block click-to-edit in Presentation
//
// Client component because useOptimistic requires a client runtime.
// ============================================================================
"use client";

import { useOptimistic } from "@sanity/visual-editing/react";
import { env } from "@workspace/env/client";
import { createDataAttribute } from "next-sanity";
import { useCallback, useMemo } from "react";

import type { PageBuilderBlock, PageBuilderBlockTypes } from "@/types";
import { EditorialSection } from "./sections/editorial-section";
import { HeroSection } from "./sections/hero-section";
import { NewsletterSection } from "./sections/newsletter-section";
import { ProductGridSection } from "./sections/product-grid-section";
import { SplitSection } from "./sections/split-section";

export type PageBuilderProps = {
  readonly pageBuilder?: PageBuilderBlock[];
  readonly id: string; // Sanity document _id
  readonly type: string; // Sanity document _type (e.g. "homePage")
};

type SanityDataAttributeConfig = {
  readonly id: string;
  readonly type: string;
  readonly path: string;
};

// The dispatch table — the single source of truth mapping Sanity _type → React component.
// Add a new block? Register it here. The `satisfies Record<...>` constraint makes
// TypeScript yell if you add a block to the schema without also adding a component.
const BLOCK_COMPONENTS = {
  heroBlock: HeroSection,
  splitBlock: SplitSection,
  productGridBlock: ProductGridSection,
  editorialBlock: EditorialSection,
  newsletterBlock: NewsletterSection,
  // biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering>
} as const satisfies Record<PageBuilderBlockTypes, React.ComponentType<any>>;

/**
 * Builds the serialized `data-sanity` attribute that Presentation reads to
 * know which field in which document to open when the user clicks a block.
 * Format: projectId=...;dataset=...;documentId=...;path=pageBuilder[_key=="..."]
 */
function createSanityDataAttribute(config: SanityDataAttributeConfig): string {
  return createDataAttribute({
    id: config.id,
    baseUrl: env.NEXT_PUBLIC_SANITY_STUDIO_URL,
    projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: env.NEXT_PUBLIC_SANITY_DATASET,
    type: config.type,
    path: config.path,
  }).toString();
}

/**
 * Rendered when Sanity returns a block _type that has no matching React component.
 * Happens if the schema was updated but the component wasn't registered, or in
 * preview mode while a new block is being prototyped.
 */
function UnknownBlockError({
  blockType,
  blockKey,
}: {
  blockType: string;
  blockKey: string;
}) {
  return (
    <div
      aria-label={`Unknown block type: ${blockType}`}
      className="flex items-center justify-center border-2 border-muted-foreground/20 border-dashed bg-muted p-8 text-center text-muted-foreground"
      key={`${blockType}-${blockKey}`}
      role="alert"
    >
      <div className="space-y-2">
        <p>Component not found for block type:</p>
        <code className="rounded bg-background px-2 py-1 font-mono text-sm">
          {blockType}
        </code>
      </div>
    </div>
  );
}

/**
 * Wraps useOptimistic so the page re-renders instantly with draft content
 * while the author edits in the studio (Presentation Tool). Without this,
 * edits only show after the next sanityFetch round-trip.
 */
function useOptimisticPageBuilder(
  initialBlocks: PageBuilderBlock[],
  documentId: string
) {
  // biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering>
  return useOptimistic<PageBuilderBlock[], any>(
    initialBlocks,
    (currentBlocks, action) => {
      // Only react to updates for *this* document. Other docs' edits are ignored.
      if (action.id === documentId && action.document?.pageBuilder) {
        return action.document.pageBuilder;
      }
      return currentBlocks;
    }
  );
}

/**
 * Builds the render function for a single block. Extracted to a hook so the
 * `createBlockDataAttribute` closure is memoized across the map() iteration
 * — keeps React from re-rendering blocks when unrelated props change.
 */
function useBlockRenderer(id: string, type: string) {
  const createBlockDataAttribute = useCallback(
    (blockKey: string) =>
      createSanityDataAttribute({
        id,
        type,
        // GROQ path expression: "the element of pageBuilder whose _key matches".
        // Presentation uses this to open the correct sub-editor.
        path: `pageBuilder[_key=="${blockKey}"]`,
      }),
    [id, type]
  );

  const renderBlock = useCallback(
    (block: PageBuilderBlock, _index: number) => {
      // Look up the component for this block's _type. If unregistered → error UI.
      const Component =
        BLOCK_COMPONENTS[block._type as keyof typeof BLOCK_COMPONENTS];

      if (!Component) {
        return (
          <UnknownBlockError
            blockKey={block._key}
            blockType={block._type}
            key={`${block._type}-${block._key}`}
          />
        );
      }

      return (
        // Wrapper carries the data-sanity attribute → click anywhere in the
        // block (in Presentation) to jump to the editor for that block.
        <div
          data-sanity={createBlockDataAttribute(block._key)}
          key={`${block._type}-${block._key}`}
        >
          {/** biome-ignore lint/suspicious/noExplicitAny: <any is used to allow for dynamic component rendering> */}
          <Component {...(block as any)} />
        </div>
      );
    },
    [createBlockDataAttribute]
  );

  return { renderBlock };
}

/**
 * PageBuilder — iterates the blocks array and dispatches each to its matching component.
 */
export function PageBuilder({
  pageBuilder: initialBlocks = [],
  id,
  type,
}: PageBuilderProps) {
  const blocks = useOptimisticPageBuilder(initialBlocks, id);
  const { renderBlock } = useBlockRenderer(id, type);

  // data-sanity on the <main> so Presentation can target the whole array
  // (used to reorder/add/delete blocks from the frontend click menu).
  const containerDataAttribute = useMemo(
    () => createSanityDataAttribute({ id, type, path: "pageBuilder" }),
    [id, type]
  );

  if (!blocks.length) {
    return null;
  }

  return (
    <main data-sanity={containerDataAttribute}>
      {blocks.map(renderBlock)}
    </main>
  );
}
