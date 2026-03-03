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
      className="w-full dark:bg-zinc-900 border rounded-lg relative flex flex-col items-center group"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full flex items-center justify-between p-2 rounded-t-lg bg-zinc-900">
        <div className="flex items-center gap-4">
          <CodeIcon className="text-muted-foreground" size={16} />

          <p className="text-muted-foreground text-sm">Typescript</p>
        </div>

        <CopyIcon
          className="text-zinc-200 opacity-0 group-hover:opacity-100"
          onClick={handleCopy}
        />
      </div>

      <div className="w-full h-full flex items-start justify-start rounded-b-lg gap-5 pb-2 bg-zinc-900">
        <div className="pl-3 h-full flex flex-col">
          {Array.from({ length: getLineCount(content) }, (_, i) => (
            <div
              key={i}
              className="text-sm text-muted-foreground font-mono pointer-events-none  flex items-center justify-center"
              style={{
                height: "20px",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

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
