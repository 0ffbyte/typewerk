"use client";

import type { Block } from "@/app/types";

import { BlockRegistry } from "@/lib/block-registry";

import Spacer from "@/components/editor/spacer";
import BlockShell from "@/components/editor/block-shell";
import { motion } from "motion/react";

export default function EditorCanvas({ blocks }: { blocks: Block[] }) {
  return blocks.map((block, index) => {
    const definition = BlockRegistry[block.type];
    if (!definition) return null;

    const isLast = index === blocks.length - 1;
    const BLOCK = definition.component;
    return (
      <motion.div
        key={block.id}
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.1,
        }}
      >
        <Spacer id={block.id} index={index} />

        {block.type === "section" && index >= 1 && (
          <div className="h-[64px] hover:bg-rose-400/10 w-full rounded-lg transition-colors duration-100 cursor-not-allowed select-none" />
        )}

        {block.type === "section" && index >= 1 && (
          <div className="border-t mb-[16px] hidden" />
        )}

        <BlockShell index={index} id={block.id}>
          <BLOCK {...block.props} index={index} id={block.id} />
        </BlockShell>

        {isLast && <Spacer id={"end-block"} index={blocks.length} />}
      </motion.div>
    );
  });
}
