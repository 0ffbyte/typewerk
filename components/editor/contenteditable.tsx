"use client";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ContentEditableProps = {
  content: string;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const ContentEditable = React.forwardRef<HTMLDivElement, ContentEditableProps>(
  ({ content, className, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const hydrated = useRef(false);

    // Merge forwarded ref + local ref
    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;

      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    useEffect(() => {
      if (!innerRef.current || hydrated.current) return;

      innerRef.current.innerHTML = content;
      hydrated.current = true;
    }, [content]);

    return (
      <div className="relative w-full">
        <div
          ref={setRef}
          {...props}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="Rich Text Editor"
          data-placeholder="Type here or press / for commands"
          className={cn(
            "outline-none resize-none overflow-hidden text-zinc-600 text-[20px] leading-[28px] w-full min-h-[20px]",
            className
          )}
        />
      </div>
    );
  }
);

ContentEditable.displayName = "ContentEditable";

export default ContentEditable;
