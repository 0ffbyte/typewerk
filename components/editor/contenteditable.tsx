"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CopyIcon } from "lucide-react";

type ContentEditableProps = {
  content: string;
  placeholder?: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ContentEditable = React.forwardRef<HTMLDivElement, ContentEditableProps>(
  (
    { content, placeholder = "Start typing", className, ...props },
    forwardedRef
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hydrated = useRef(false);

    const [toolbarPos, setToolbarPos] = useState<Record<string, number> | null>(
      null
    );
    const selectionRef = useRef<Selection>(null);

    // Merge forwarded ref + local ref
    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const handleInput = (e: React.ChangeEvent<HTMLDivElement>) => {
      console.log(e.target.innerHTML);
    };

    useEffect(() => {
      if (!innerRef.current || hydrated.current) return;

      innerRef.current.innerHTML = content;
      hydrated.current = true;
    }, [content]);

    // selection api
    useEffect(() => {
      const element = innerRef.current;
      const container = containerRef.current;
      if (!element || !container) return;

      const handleSelectionChange = () => {
        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0) {
          setToolbarPos(null);
          return;
        }

        const range = selection.getRangeAt(0);

        if (
          selection.toString().length >= 1 &&
          element.contains(range.commonAncestorContainer)
        ) {
          const rect = range.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          // Calculate position relative to the container
          setToolbarPos({
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top - 48, // Offset above selection
          });
          selectionRef.current = selection;
        } else {
          setToolbarPos(null);
        }
      };

      document.addEventListener("selectionchange", handleSelectionChange);

      return () => {
        document.removeEventListener("selectionchange", handleSelectionChange);
      };
    }, []);

    return (
      <div ref={containerRef} className="relative w-full">
        <div
          ref={setRef}
          {...props}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="rich text editor"
          data-placeholder={placeholder}
          className={cn(
            "outline-none select-text- resize-none overflow-hidden text-[20px] leading-[28px] w-full min-h-[20px]",
            className
          )}
        />

        {(!content || innerRef.current?.textContent?.length === 0) && (
          <div
            className="pointer-events-none select-none absolute left-0 top-0 text-zinc-400 text-[20px] leading-[28px] w-full min-h-[20px]"
            style={{ userSelect: "none" }}
            aria-hidden="true"
            aria-label="placeholder"
          >
            {placeholder}
          </div>
        )}

        {toolbarPos && (
          <div
            className="absolute flex gap-4 items-center justify-center text-xs px-3 h-[38px] w-fit rounded-lg shadow-2xl bg-zinc-800/90 text-zinc-100 backdrop-blur-xs z-10 select-none"
            style={{
              left: `${toolbarPos.x}px`,
              top: `${toolbarPos.y}px`,
              transform: "translateX(-50%)", // Center horizontally
            }}
          >
            <button
              className="cursor-default hover:text-zinc-300 transition-colors duration-100"
              onClick={() => {
                navigator.clipboard.writeText(
                  selectionRef.current?.toString() ?? ""
                );
                selectionRef.current?.collapse(selectionRef.current?.focusNode);
              }}
            >
              Copy
            </button>
            <div className="h-[16] w-[1] bg-zinc-500" />
            <button className="cursor-default hover:text-zinc-300 transition-colors duration-100">
              Share
            </button>
          </div>
        )}
      </div>
    );
  }
);

ContentEditable.displayName = "ContentEditable";

export default ContentEditable;
