"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

// define block props
export type AlertumProps = {
  content: string;
};

// define block component
const AlertumBlock = ({ content, index }: AlertumProps & BlockProps) => {
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
      if (block.type === "alertum") {
        block.props.content = v;
      }
    });
  };

  return (
    <div className="p-4 w-full bg-teal-200 rounded-[8px]">
      <ContentEditable
        className="text-teal-800 text-md"
        ref={ref}
        value={content}
        onEdit={handleEdit}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default AlertumBlock;
