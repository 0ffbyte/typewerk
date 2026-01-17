"use client";

import type { SiteObject } from "@/store/editor-store";
import { BlockRegistry } from "@/lib/block-registry";
import Header from "./header";
import FadeIn from "./fade-in";

export default function Renderer({ siteObject }: { siteObject: SiteObject }) {
  return (
    <div className="flex flex-col items-start justify-start gap-[24px]">
      <FadeIn delay={0.2} duration={0.4}>
        <Header {...siteObject.header} />
      </FadeIn>

      {siteObject.blocks.map((block, index) => {
        const Block = BlockRegistry[block.type]["renderedComponent"];
        if (!Block) return null;

        return (
          <div key={block.uuid} className="w-full">
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
