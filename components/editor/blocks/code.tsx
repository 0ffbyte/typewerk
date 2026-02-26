"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef, useState } from "react";
import useFocused from "@/hooks/use-focused";
import { useIsMobile } from "@/hooks/use-mobile";

import { CopyIcon } from "@radix-ui/react-icons";
import { CodeIcon } from "lucide-react";

// define block props
export type CodeProps = {
  content: string;
};

// define block component
const CodeBlock = ({ content, index, id }: CodeProps & BlockProps) => {
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
      if (block.type === "code") {
        block.props.content = v;
      }
    });
  };

  return (
    <div
      className="p-4 w-full bg-zinc-900 border rounded-lg relative flex flex-col items-center gap-2"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-start gap-2">
        <CodeIcon className=" text-zinc-400" size={16} />
        <p className="text-zinc-400 text-xs">Code</p>
      </div>
      <ContentEditable
        id={id}
        allowFormatting={false}
        syntaxHighlighting={true}
        placeholder="Type code here..."
        ref={ref}
        value={content}
        onEdit={handleEdit}
      />
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
