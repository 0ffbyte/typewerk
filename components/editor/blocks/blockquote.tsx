"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable/contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

// define block props
export type BlockquoteProps = {
  content: string;
};

// define block component
const BlockquoteBlock = ({
  content,
  index,
  id,
}: BlockquoteProps & BlockProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);
  useFocused(ref, index);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      if (
        ref.current?.textContent?.length === 0 &&
        ref.current?.innerHTML?.length <= 4
      ) {
        e.preventDefault();
        removeBlock(index);
      }
    }
  };

  const handleEdit = (v: string) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block.type === "blockquote") {
        block.props.content = v;
      }
    });
  };

  return (
    <div className="pl-4 w-full" onKeyDown={handleKeyDown}>
      <div className="absolute left-0 top-0 h-full w-[4px] bg-zinc-500 rounded-full" />
      <ContentEditable id={id} ref={ref} value={content} onEdit={handleEdit} />
    </div>
  );
};

export default BlockquoteBlock;
