"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable/contenteditable";
import { useEffect, useRef, useState } from "react";
import useFocused from "@/hooks/use-focus";

import { CodeIcon } from "lucide-react";

import { getLineCount } from "@/lib/utils";

const MAX_COLLAPSED_LINES = 14;
const CODE_LINE_HEIGHT_PX = 21;
const COLLAPSED_MAX_HEIGHT = MAX_COLLAPSED_LINES * CODE_LINE_HEIGHT_PX;

// define block props
export type CodeProps = {
  content: string;
};

// define block component
const CodeBlock = ({ content, index, id }: CodeProps & BlockProps) => {
  const state = useEditorStore((state) => state);
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const lineCount = getLineCount(content);
  const isTruncatable = lineCount > MAX_COLLAPSED_LINES;
  const visibleGutterLines =
    isTruncatable && !expanded ? MAX_COLLAPSED_LINES : lineCount;

  useEffect(() => {
    if (lineCount <= MAX_COLLAPSED_LINES) setExpanded(false);
  }, [lineCount]);

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

  const handleBlur = () => {
    const textContent = ref.current?.textContent;
    if (
      textContent?.length === 0 &&
      state.data.pages[state.pageIndex].blocks.length > 1
    )
      removeBlock(index);
  };

  return (
    <div
      className="w-full grid grid-cols-[36px_1fr] grid-rows-[36px_1fr] rounded-lg border overflow-clip select-none"
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <div className="bg-zinc-900 flex items-center justify-center rounded-tl-lg select-none">
        <CodeIcon className="text-muted-foreground" size={16} />
      </div>

      <div className="bg-zinc-900 flex items-center pl-2 rounded-tr-lg select-none">
        <p className="text-muted-foreground text-sm">Code</p>
      </div>

      <div className="w-full bg-zinc-900 py-2 rounded-bl-lg select-none">
        {Array.from({ length: visibleGutterLines }, (_, i) => (
          <div
            key={i}
            className="text-sm text-muted-foreground font-mono pointer-events-none flex items-center justify-center"
            style={{
              height: `${CODE_LINE_HEIGHT_PX}px`,
              width: "36px",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      <div className="w-full bg-zinc-900 h-full flex flex-col items-stretch justify-start min-h-[20px] px-2 pt-2 rounded-br-lg select-none">
        <div
          className={
            isTruncatable && !expanded ? "overflow-hidden min-w-0" : "min-w-0"
          }
          style={
            isTruncatable && !expanded
              ? { maxHeight: COLLAPSED_MAX_HEIGHT }
              : undefined
          }
        >
          <ContentEditable
            id={id}
            blockIndex={index}
            allowFormatting={false}
            syntaxHighlighting={true}
            placeholder="let hey = 'mom!';"
            ref={ref}
            value={content}
            onEdit={handleEdit}
          />
        </div>
        {isTruncatable && (
          <button
            type="button"
            className="mt-1 mb-1 self-start text-xs text-muted-foreground hover:text-zinc-200 underline underline-offset-2"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setExpanded((v) => !v);
              requestAnimationFrame(() => {
                if (ref.current) {
                  ref.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "start",
                  });
                }
              });
            }}
          >
            {expanded ? "Show less" : "(" + (lineCount - 14) + ") lines"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
