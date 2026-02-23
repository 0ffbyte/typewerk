"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef, useState } from "react";
import useFocused from "@/hooks/use-focused";
import { useIsMobile } from "@/hooks/use-mobile";

import { CopyIcon } from "@radix-ui/react-icons";

// define block props
export type CodeProps = {
  content: string;
};

// define block component
const CodeBlock = ({ content, index, id }: CodeProps & BlockProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);

  const [isMouseOver, setIsMouseOver] = useState(false);

  const { isFocused } = useFocused(ref, index);
  const isMobile = useIsMobile();

  const isToolbarVisible = isMobile ? isFocused : isMouseOver;

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
      if (block.type === "code") {
        block.props.content = v;
      }
    });
  };

  return (
    <div
      className="p-4 w-full bg-zinc-50 rounded-lg border relative"
      onKeyDown={handleKeyDown}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      <ContentEditable
        id={id}
        allowFormatting={false}
        syntaxHighlighting={true}
        placeholder="Type code here..."
        ref={ref}
        value={content}
        onEdit={handleEdit}
      />

      {isToolbarVisible && <Toolbar />}
    </div>
  );
};

const Toolbar = () => {
  return (
    <div className="absolute top-1 right-1 gap-1 flex items-center justify-start">
      <div className="h-[32px] aspect-square rounded-md bg-zinc-900/90 flex items-center justify-center gap-2 backdrop-blur-xs ">
        <button
          title="Copy"
          className="h-full aspect-square flex items-center justify-center"
        >
          <CopyIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
        </button>
      </div>
    </div>
  );
};

export default CodeBlock;
