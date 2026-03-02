"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div
      className="w-full bg-zinc-200 dark:bg-zinc-900 border rounded-lg relative flex flex-col items-center overflow-hidden group"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-between p-2 border-b border-border/20">
        <div className="flex items-center gap-2">
          <CodeIcon className=" text-zinc-400" size={16} />
          <p className="text-zinc-400 text">Typescript</p>
        </div>

        <CopyIcon
          className="text-zinc-400 opacity-0 group-hover:opacity-100"
          onClick={handleCopy}
        />
      </div>

      <div className="w-full flex items-center justify-start">
        <ContentEditable
          id={id}
          className="pl-8 pr-4 py-2"
          allowFormatting={false}
          syntaxHighlighting={true}
          placeholder="Type code here"
          ref={ref}
          value={content}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default CodeBlock;
