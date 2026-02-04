"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
} from "react";
import sanitize from "sanitize-html";
import { cn } from "@/lib/utils";
import { SANITIZE_CONFIG } from "@/lib/sanitize";

type ToolbarPos = { x: number; y: number };

type ContentEditableProps = {
  value: string;
  placeholder?: string;
  className?: string;
  onEdit?: (value: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const ContentEditable = forwardRef<HTMLDivElement, ContentEditableProps>(
  (
    { value, placeholder = "Start typing", className, onEdit, ...props },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const selectionRef = useRef<Selection | null>(null);

    const isFocusedRef = useRef(false);
    const isComposingRef = useRef(false);

    const [isEmpty, setIsEmpty] = useState(true);
    const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);

    /** merge forwarded ref */
    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        innerRef.current = node;
        if (!ref) return;
        if (typeof ref === "function") ref(node);
        else ref.current = node;
      },
      [ref]
    );

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
    const handleInput = useCallback(() => {
      if (!innerRef.current) return;

      const text = innerRef.current.textContent?.trim();
      setIsEmpty(!text);

      if (!isComposingRef.current) {
        onEdit?.(innerRef.current.innerHTML);
      }
    }, [onEdit]);

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
          ref={setRef}
          {...props}
          contentEditable
          suppressContentEditableWarning
          spellCheck={false}
          aria-label="rich text editor"
          className={cn(
            "outline-none select-text overflow-hidden font-medium text-[16px] leading-[24px] w-full min-h-[20px] text-muted-foreground whitespace-pre-wrap border-b border-transparent",
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
          onPaste={handlePaste}
        />

        {isEmpty && (
          <div
            className={cn(
              "pointer-events-none absolute left-0 top-0 text-zinc-400 text-[16px] leading-[24px] w-full min-h-[20px]",
              className
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
            >
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
