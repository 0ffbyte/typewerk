"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";

import type { BlockProps } from "@/app/types";
import { slugify } from "@/lib/utils";

import ContentEditable from "../contenteditable";

// define block props
export type SectionProps = {
  title: string;
};

// define block component
const SectionBlock = ({ title = "", index, id }: SectionProps & BlockProps) => {
  const setState = useEditorStore((state) => state.setState);

  const ref = useRef<HTMLDivElement>(null);
  useFocused(ref, index);

  const addBlock = useEditorStore((state) => state.addBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") addBlock("text", index + 1);
    else if (e.key === "Backspace") {
      console.log("backspace");
      if (ref.current?.textContent?.length === 0) {
        e.preventDefault();
        removeBlock(index);
      }
    }
  };

  const handleEdit = (v: string) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block.type === "section") {
        block.props.title = v;
      }
    });
  };

  return (
    <div className="w-full" onKeyDown={handleKeyDown} id={slugify(title)}>
      <ContentEditable
        id={id}
        ref={ref}
        value={title}
        onEdit={handleEdit}
        placeholder="Section"
        maxLength={32}
        multiLine={false}
        allowFormatting={false}
        className="text-foreground dark:text-zinc-100"
      />
    </div>
  );
};

export default SectionBlock;
