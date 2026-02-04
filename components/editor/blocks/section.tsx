"use client";

import { useEditorStore } from "@/store/editor-store";
import { usePageStore } from "@/store/page-store";
import type { BlockProps } from "@/app/types";
import useFocused from "@/hooks/use-focused";
import { cn } from "@/lib/utils";
import { useOnInView } from "react-intersection-observer";
import { useRef } from "react";

// define block props
export type SectionProps = {
  title: string;
};

// define block component
const SectionBlock = ({ title = "", index }: SectionProps & BlockProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const setState = useEditorStore((s) => s.setState);
  const addBlock = useEditorStore((s) => s.addBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  const pageIndex = useEditorStore((s) => s.pageIndex);
  const setSectionIndex = usePageStore((s) => s.setSectionIndex);

  const ref = useOnInView(
    (inView, entry) => {
      if (inView) setSectionIndex(index);
      else console.log("Element left view", entry.target);
    },
    {
      root: null,
      rootMargin: "-20% 0px -40% 0px",
      threshold: 1,
    }
  );
  useFocused(ref, index);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBlock("text", index + 1);
    } else if (e.key === "Backspace" && (title ?? "").length === 0) {
      removeBlock(index);
    }
  };

  return (
    <input
      id={`${title.toLowerCase().replace(/\s+/g, "-")}`}
      ref={ref}
      className={cn(
        "font-medium text-[16px] leading-[24px] outline-none placeholder-border w-full"
      )}
      type="text"
      placeholder="Section"
      maxLength={24}
      value={title}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        setState((s) => {
          const block = s.data.pages[pageIndex].blocks[index];
          if (block.type === "section") {
            block.props.title = e.target.value;
          }
        });
      }}
    />
  );
};

export default SectionBlock;
