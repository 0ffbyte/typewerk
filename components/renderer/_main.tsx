"use client";

import type { SiteObject } from "@/store/editor-store";
import { BlockRegistry } from "@/lib/block-registry";
import Header from "./header";

export default function Renderer({ siteObject }: { siteObject: SiteObject }) {
  return (
    <div className="flex flex-col items-start justify-start gap-[24px]">
      <Header {...siteObject.header} />

      {siteObject.blocks.map((block, index) => {
        const Block = BlockRegistry[block.type]["renderedComponent"];
        if (!Block) return null;

        return (
          <div key={block.uuid} className="w-full">
            {index >= 1 && block.type === "section" && (
              <div className="h-[68px] w-[24px] border-t border-zinc-600" />
            )}

            <Block {...block.props} index={index} />
          </div>
        );
      })}
    </div>
  );
}
