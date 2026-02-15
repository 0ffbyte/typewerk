"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import mergeRefs from "merge-refs";

import { cn } from "@/lib/utils";
import sanitize from "sanitize-html";
import { SANITIZE_CONFIG } from "@/lib/sanitize";

import SlashMenu from "./slashMenu";

type ToolbarPos = { x: number; y: number };

type ContentEditableProps = {
  value: string;
  placeholder?: string;
  maxLength?: number;
  multiLine?: boolean;
  className?: string;
  ref: React.RefObject<HTMLDivElement | null>;
  onEdit?: (value: string) => void;
};

const ContentEditable = ({
  value,
  placeholder = "Start typing",
  maxLength = 256,
  multiLine = true,
  className,
  ref,
  onEdit,
}: ContentEditableProps) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<Selection | null>(null);

  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);

  const [isEmpty, setIsEmpty] = useState(true);
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);

  /** sync external value → DOM (only when not editing) */
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (!isFocusedRef.current && el.innerHTML !== value) {
      el.innerHTML = value || "";
      setIsEmpty(!el.textContent?.trim());
    }
  }, [value]);

  /** emit sanitized value */
  const emitSanitizedEdit = useCallback(() => {
    if (!innerRef.current || !onEdit) return;
    onEdit(sanitize(innerRef.current.innerHTML, SANITIZE_CONFIG));
  }, [onEdit]);

  /** handle input */
  const handleInput = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!innerRef.current) return;

      const text = innerRef.current.textContent;
      setIsEmpty(!text || !innerRef.current.innerHTML);

      if (!isComposingRef.current) onEdit?.(innerRef.current.innerHTML || "");
    },
    [onEdit]
  );

  const handleBeforeInput = (e: React.InputEvent<HTMLDivElement>) => {
    const currentText = innerRef.current?.textContent || "";
    if (currentText.length >= maxLength) e.preventDefault();

    return;
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const el = innerRef.current;
      if (!el) return;

      const clipboard = e.clipboardData;
      const html = clipboard.getData("text/html");
      const text = clipboard.getData("text/plain");

      const raw = html || text;
      if (!raw) return;

      const sanitized = sanitize(raw, SANITIZE_CONFIG);

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      // Convert sanitized HTML → nodes
      const temp = document.createElement("div");
      temp.innerHTML = sanitized.trim();

      const fragment = document.createDocumentFragment();
      let lastNode: ChildNode | null = null;

      while (temp.firstChild) {
        lastNode = fragment.appendChild(temp.firstChild);
      }

      range.insertNode(fragment);

      // Move caret to end of pasted content
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Update state
      setIsEmpty(!el.textContent?.trim());
      onEdit?.(el.innerHTML);
    },
    [onEdit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!multiLine || isEmpty) return;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);

        // Insert first br for line break
        const br1 = document.createElement("br");
        range.insertNode(br1);

        // Move cursor AFTER the second br
        range.setStartAfter(br1);
        range.setEndAfter(br1);

        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
    [isEmpty]
  );

  const selectAll = useCallback(() => {
    const el = innerRef.current;
    if (!el) return;

    // create a range object and select all
    const range = document.createRange();
    range.selectNodeContents(el);

    // update selection
    const selection = selectionRef.current;
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(range);
  }, [innerRef]);

  const toggleFormat = useCallback((tagName: "b" | "i" | "u" | "mark") => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const fragment = range.cloneContents();
    console.log("frag:", fragment);
  }, []);

  /** selection toolbar logic (scoped) */
  useEffect(() => {
    const el = innerRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const updateSelection = () => {
      const selection = document.getSelection();
      if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.toString().length === 0
      ) {
        setToolbarPos(null);
        return;
      }

      const range = selection.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) {
        setToolbarPos(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setToolbarPos({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 48,
      });

      selectionRef.current = selection;
    };

    document.addEventListener("selectionchange", updateSelection);

    return () => {
      document.removeEventListener("selectionchange", updateSelection);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        ref={mergeRefs(innerRef, ref)}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        aria-label="rich text editor"
        className={cn(
          "outline-none font-medium select-text overflow-hidden text-[16px] leading-[24px] w-full min-h-[24px] text-muted-foreground whitespace-pre-wrap border-b border-transparent",
          className
        )}
        onFocus={() => (isFocusedRef.current = true)}
        onBlur={() => {
          isFocusedRef.current = false;
          emitSanitizedEdit();
          setToolbarPos(null);
        }}
        onCompositionStart={() => (isComposingRef.current = true)}
        onCompositionEnd={() => (isComposingRef.current = false)}
        onInput={handleInput}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />

      {isEmpty && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 text-[16px] leading-[24px] w-full min-h-[20px]",
            className,
            "text-zinc-400"
          )}
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}

      {toolbarPos && (
        <div
          className="absolute flex gap-3 items-center text-xs px-3 h-[38px] rounded-lg shadow-2xl bg-zinc-800/90 text-zinc-100 backdrop-blur-xs z-10 select-none"
          style={{
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: "translateX(-50%)",
          }}
        >
          <button
            className="hover:text-zinc-300 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              navigator.clipboard.writeText(
                selectionRef.current?.toString() ?? ""
              );
            }}
          >
            Copy
          </button>
          <div className="h-[16px] w-px bg-zinc-500" />
          <button
            className="hover:text-zinc-300 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectAll()}
          >
            Select All
          </button>
          <div className="h-[16px] w-px bg-zinc-500" />
          <button
            className="hover:text-zinc-300 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("b")}
          >
            Bold
          </button>
        </div>
      )}

      <SlashMenu ref={innerRef} />
    </div>
  );
};

export default ContentEditable;
