"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

import { CopyIcon } from "@radix-ui/react-icons";
import { CodeIcon } from "lucide-react";

import { getLineCount, THEME_MAPPING, cn } from "@/lib/utils";

// define block props
export type CodeProps = {
  content: string;
};

// define block component
const CodeBlock = ({ content, index, id }: CodeProps & BlockProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);

  const theme = useEditorStore((s) => s.data.theme);

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
      className="w-full grid grid-cols-[40px_1fr] grid-rows-[40px_1fr] rounded-lg overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-zinc-800 flex items-center justify-center">
        <CodeIcon className="text-muted-foreground" size={16} />
      </div>

      <div className="bg-zinc-900 flex items-center pl-2">
        <p className="text-muted-foreground text-sm">Typescript</p>
      </div>

      <div className="w-full bg-zinc-800 pb-2">
        {Array.from({ length: getLineCount(content) }, (_, i) => (
          <div
            key={i}
            className="text-sm text-muted-foreground font-mono pointer-events-none flex items-center justify-center"
            style={{
              height: "20px",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="w-full bg-zinc-900 px-2 pb-2">
        <ContentEditable
          id={id}
          allowFormatting={false}
          syntaxHighlighting={true}
          placeholder="let hey = 'mom!';"
          ref={ref}
          value={content}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default CodeBlock;

/**
 * 
 * <div
      className="w-full dark:bg-zinc-900 bg-zinc-900 rounded-lg relative flex items-center justify-start group gap-2"
      onKeyDown={handleKeyDown}
    >
      <div className="w-10 h-full flex flex-col items-center justify-start">
        <div className="w-10 h-10 flex items-center justify-center">
          <CodeIcon className="text-muted-foreground" size={16} />
        </div>

        <div className="w-full flex-col items-center justify-start pb-2">
          {Array.from({ length: getLineCount(content) }, (_, i) => (
            <div
              key={i}
              className="text-sm text-muted-foreground font-mono pointer-events-none flex items-center justify-center"
              style={{
                height: "20px",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-full flex flex-col items-start justify-center">
        <div className="h-10 flex items-center justify-betwee">
          <p className="text-muted-foreground text-sm">Typescript</p>
        </div>
        <div className="w-full pb-2 border">
          <ContentEditable
            id={id}
            allowFormatting={false}
            syntaxHighlighting={true}
            placeholder="let hey = 'mom!';"
            ref={ref}
            value={content}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
 */
