"use client";

import type { BaseBlock } from "@/app/types";

import { BlockRegistry } from "@/lib/block-registry";

import { motion } from "framer-motion";
import Spacer from "@/components/editor/spacer";
import BlockHandle from "@/components/editor/block-wrapper";

export default function EditorCanvas({ blocks }: { blocks: BaseBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const definition = BlockRegistry[block.type];
        if (!definition) return null;

        const Block = definition.component;
        const isLast = index === blocks.length - 1;

        return (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.1,
            }}
            layout="position"
            key={block.id}
            className="w-full"
          >
            <Spacer id={block.id} index={index} />
            {block.type === "section" && index >= 1 && (
              <div className="h-[64px] hover:bg-rose-400/10 w-full rounded-lg transition-colors duration-100 cursor-not-allowed select-none" />
            )}

            <BlockHandle index={index} id={block.id}>
              <Block {...block.props} index={index} id={block.id} />
            </BlockHandle>

            {isLast && <Spacer id={"end-block"} index={blocks.length} />}
          </motion.div>
        );
      })}
    </>
  );
}
