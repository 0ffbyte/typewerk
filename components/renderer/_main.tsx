"use client";

import { useMemo } from "react";
import type { SiteObject } from "@/app/types";
import { BlockRegistry } from "@/lib/block-registry";
import Header from "./header";
import FadeIn from "./fade-in";
import { useSearchParams } from "next/navigation";

export default function Renderer({ siteObject }: { siteObject: SiteObject }) {
  const searchParams = useSearchParams();
  const pages = siteObject.pages;

  const pageIndex = useMemo(() => {
    const pageName = searchParams.get("p");
    if (pageName === "home" || !pageName) {
      return 0;
    }
    const foundIndex = pages.findIndex((p) => p.name === pageName);
    return foundIndex !== -1 ? foundIndex : 0;
  }, [searchParams, pages]);

  const pageData = useMemo(() => {
    return siteObject.pages[pageIndex];
  }, [siteObject.pages, pageIndex]);

  return (
    <div className="flex flex-col items-start justify-start gap-[24px]">
      <FadeIn delay={0.2} duration={0.4}>
        <Header {...siteObject.header} />
      </FadeIn>

      {pageData.blocks.map((block, index) => {
        const Block = BlockRegistry[block.type]["renderedComponent"];
        if (!Block) return null;

        return (
          <div key={block.id} className="w-full">
            {index >= 1 && block.type === "section" && (
              <div className="h-[68px] w-[24px] bg-rose-200 border-rose-500" />
            )}

            <FadeIn delay={index * 0.2 + 0.2} duration={0.4}>
              <Block {...block.props} index={index} />
            </FadeIn>
          </div>
        );
      })}
    </div>
  );
}
