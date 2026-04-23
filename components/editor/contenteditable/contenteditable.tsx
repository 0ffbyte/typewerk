"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import mergeRefs from "merge-refs";
import "@/lib/prism-themes/dracula.css";

import { useEditorStore } from "@/store/editor-store";
import { useSelectionStore } from "@/store/selection-store";

import Prism from "prismjs";
import sanitize from "sanitize-html";
import { SANITIZE_CONFIG } from "@/lib/sanitize";
import { cn, moveCaretToEnd, THEME_MAPPING } from "@/lib/utils";

import SlashMenu from "./slashMenu";

type ContentEditableProps = {
  id: string;
  blockIndex: number;
  value: string;
  ref?: any;
  placeholder?: string;
  maxLength?: number;
  multiLine?: boolean;
  allowFormatting?: boolean;
  syntaxHighlighting?: boolean;
  className?: string;
  placeholderClassName?: string;
  onEdit?: (value: string) => void;
};

const ContentEditable = ({
  id,
  blockIndex,
  value,
  placeholder = "Type here or tap / for commands",
  maxLength = 1024,
  multiLine = true,
  allowFormatting = true,
  syntaxHighlighting = false,
  ref,
  className,
  placeholderClassName,
  onEdit,
}: ContentEditableProps) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const preventNewLine = useEditorStore((state) => state.preventNewLine);
  const isEditable = useEditorStore((state) => state.isEditable);
  const theme = useEditorStore((s) => s.data.theme);

  const isMultiline = useSelectionStore((s) => s.meta.isMultiSelection);

  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);

  const [isEmpty, setIsEmpty] = useState(true);

  /** sync external value → DOM (only when not editing) */
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (el.innerHTML !== value) {
      el.innerHTML = sanitize(value, SANITIZE_CONFIG) || "";
      setIsEmpty(!el.innerText?.trim());
      moveCaretToEnd(el);
    }
  }, [value]);

  /** emit sanitized value */
  const emitSanitizedEdit = useCallback(() => {
    if (!innerRef.current || !onEdit) return;
    onEdit(sanitize(innerRef.current.innerHTML, SANITIZE_CONFIG));
    setIsEmpty(!innerRef.current.innerText?.trim());
  }, [onEdit]);

  /** handle input */
  const handleInput = useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!innerRef.current) return;

      const text = innerRef.current.textContent;
      setIsEmpty(!text || !innerRef.current.innerHTML);

      if (!isComposingRef.current) onEdit?.(innerRef.current.innerHTML);
    },
    [onEdit]
  );

  const handleBeforeInput = (e: React.InputEvent<HTMLDivElement>) => {
    const currentText = innerRef.current?.textContent || "";
    if (currentText.length >= maxLength && !preventNewLine) e.preventDefault();

    return;
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();

      const el = innerRef.current;
      if (!el) return;

      const clipboard = e.clipboardData;
      const text = clipboard.getData("text/plain");
      if (!text) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      range.deleteContents();

      if (!allowFormatting) {
        // Plain text only: insert a text node so no HTML/formatting is applied
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        setIsEmpty(!el.textContent?.trim());
        onEdit?.(el.innerHTML);
        return;
      }

      const html = clipboard.getData("text/html");
      const raw = html || text;

      console.log("raw text:", raw);
      const sanitized = sanitize(raw, SANITIZE_CONFIG);

      console.log("sanitized text:", sanitized);

      const temp = document.createElement("div");
      temp.innerHTML = sanitized.trim();

      const fragment = document.createDocumentFragment();
      let lastNode: ChildNode | null = null;

      while (temp.firstChild) {
        lastNode = fragment.appendChild(temp.firstChild);
      }

      range.insertNode(fragment);

      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setIsEmpty(!el.textContent?.trim());
      onEdit?.(el.innerHTML);
    },
    [onEdit, allowFormatting]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!allowFormatting && (e.ctrlKey || e.metaKey)) {
        const key = e.key.toLowerCase();
        if (key === "b" || key === "i" || key === "u" || key === "k") {
          e.preventDefault();
          return;
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (!multiLine || isEmpty) return;

        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const br = document.createElement("br");

        range.insertNode(br);
        range.setStartAfter(br);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
        emitSanitizedEdit();
      } else if (e.key === "Backspace" && isMultiline) {
        e.preventDefault();
      }
    },
    [isEmpty, allowFormatting, multiLine, isMultiline, emitSanitizedEdit] // add emitSanitizedEdit
  );

  return (
    <div ref={containerRef} className="relative w-full" draggable={false}>
      <div
        id={id}
        data-class="editor-contenteditable"
        data-block-index={blockIndex}
        data-allow-formatting={allowFormatting}
        ref={mergeRefs(innerRef, ref)}
        contentEditable={isEditable}
        suppressContentEditableWarning
        spellCheck={!syntaxHighlighting}
        aria-label="rich text editor"
        className={cn(
          "outline-none text-muted-foreground border border-transparent select-text text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] w-full sm:min-h-[28px] min-h-[24px] z-40 whitespace-pre-wrap",
          THEME_MAPPING.typography[theme?.typography],
          syntaxHighlighting &&
            "caret-blue-500 text-red-500/0 font-mono whitespace-pre overflow-x-auto text-[14px] sm:text-[14px] sm:leading-[24px] min-h-[24px]",
          !isEditable && "border-red-500/0",
          isMultiline && "border-purple-500/0",
          className
        )}
        style={{
          fontSmooth: "always",
          fontKerning: "normal",
        }}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          emitSanitizedEdit();
        }}
        onCompositionStart={() => (isComposingRef.current = true)}
        onCompositionEnd={() => (isComposingRef.current = false)}
        onInput={handleInput}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      />

      {syntaxHighlighting && (
        <SyntaxHighlighterOverlay
          content={innerRef.current?.innerText ?? ""}
          innerRef={innerRef}
          className={className}
        />
      )}

      {isEmpty && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 text-[16px] leading-[28px] sm:text-[18px] sm:leading-[28px] w-full sm:min-h-[28px] min-h-[24px]",
            syntaxHighlighting &&
              "caret-blue-500 font-mono whitespace-pre overflow-x-auto text-[14px] sm:text-[14px] sm:leading-[24px] min-h-[24px]",
            className,
            "text-muted-foreground/50",
            placeholderClassName
          )}
          aria-hidden="true"
        >
          {placeholder}
        </div>
      )}

      <SlashMenu ref={innerRef} />
    </div>
  );
};

const SyntaxHighlighterOverlay = ({
  content,
  innerRef,
  className,
}: {
  content: string;
  innerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !innerRef?.current) return;

    const handleScroll = () => {
      if (ref.current && innerRef.current) {
        ref.current.scrollLeft = innerRef.current.scrollLeft;
        ref.current.scrollTop = innerRef.current.scrollTop;
      }
    };

    const inner = innerRef.current;
    inner.addEventListener("scroll", handleScroll);
    inner.addEventListener("keydown", handleScroll);

    // Sync initial scroll state
    handleScroll();

    return () => {
      inner.removeEventListener("scroll", handleScroll);
      inner.removeEventListener("keydown", handleScroll);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none flex items-center justify-center">
      <div
        ref={ref}
        aria-hidden="true"
        spellCheck={false}
        className={cn(
          "text-foreground font-mono pointer-events-none select-none overflow-x-auto absolute top-0 left-0 outline-none text-[14px] leading-[24px] w-full min-h-[24px] whitespace-pre",
          className
        )}
        style={
          {
            //scrollbarWidth: "none",
            //msOverflowStyle: "none",
          }
        }
        dangerouslySetInnerHTML={{
          __html: Prism.highlight(
            content,
            Prism.languages.javascript,
            "javascript"
          ),
        }}
      />
    </div>
  );
};

export default ContentEditable;
