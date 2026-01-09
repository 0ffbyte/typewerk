"use client";

import type { SiteObject } from "@/store/editor-store";
import { BlockRegistry } from "@/lib/block-registry";

export default function Renderer({ siteObject }: { siteObject: SiteObject }) {
  return (
    <div className="flex flex-col items-start justify-start gap-[24px] h-full flex-1">
      <h1>{siteObject.header.heading}</h1>

      {siteObject.blocks.map((block, index) => {
        const definition = BlockRegistry[block.type];
        if (!definition) return null;

        const Block = definition.renderedComponent;

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
