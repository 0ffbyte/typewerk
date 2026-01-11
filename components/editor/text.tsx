"use client";
import { useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import type { BlockProps } from "@/app/types";
import useFocus from "@/hooks/use-focus";
import sanitizeHtml from "sanitize-html";

export type Props = BlockProps & {
  content: string;
};

export default function TextBlock({ content, index }: Props) {
  const setState = useEditorStore((state) => state.setState);
  const { ref, isFocused } = useFocus(index);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    if (isFocused && ref.current) {
      // Move caret to the end of contentEditable
      const el = ref.current;
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isFocused]);

  const applyFormat = (tag: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    // Check if selection is within our editor
    if (!ref.current?.contains(range.commonAncestorContainer)) {
      ref.current?.focus();
      return;
    }

    // Check if already formatted
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode as Node;
    }

    // Toggle off if already has the tag
    if (node.nodeName.toLowerCase() === tag.toLowerCase()) {
      const parent = node.parentNode;
      while (node.firstChild) {
        parent?.insertBefore(node.firstChild, node);
      }
      parent?.removeChild(node);
      return;
    }

    // Apply format
    if (!range.collapsed) {
      const element = document.createElement(tag);
      try {
        range.surroundContents(element);
      } catch {
        // If range spans multiple elements, extract and wrap
        const fragment = range.extractContents();
        element.appendChild(fragment);
        range.insertNode(element);
      }

      // Restore selection
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(element);
      selection.addRange(newRange);
    }

    ref.current?.focus();
  };

  useEffect(() => {
    // initialize editor content
    if (ref.current && ref.current.innerHTML === "") {
      ref.current.innerHTML = content;
      setIsInitialized(true);
    }
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      console.log(selection);
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setToolbarPos(null);
        return;
      }

      const range = selection.getRangeAt(0);

      // Check if selection is within our editor
      if (!ref.current?.contains(range.commonAncestorContainer)) {
        setToolbarPos(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const editorRect = ref.current?.getBoundingClientRect();

      if (editorRect) {
        setToolbarPos({
          top: rect.top - editorRect.bottom - 4,
          left: rect.left - editorRect.left + rect.width / 2 - 75,
        });
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleInput = () => {
    if (ref.current) {
      setState((s) => {
        const block = s.data.blocks[index];
        if (block.type === "text") {
          const sanizitedContent = sanitizeHtml(ref.current?.innerHTML ?? "", {
            allowedTags: ["b", "u", "i", "strong", "em", "br", "a", "p"],
          });
          block.props.content = sanizitedContent;
        }
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const isAtStart =
      range.startOffset === 0 &&
      range.startContainer === ref.current?.firstChild;
    const isAtEnd =
      range.startOffset === (range.startContainer.textContent?.length ?? 0);

    if (isAtStart) {
      //setTraversal("backward");
    } else if (isAtEnd) {
      //setTraversal("forward");
    } else {
      //setTraversal(null);
    }
  };
  return (
    <div className="w-full relative">
      {toolbarPos && (
        <div
          className="absolute flex gap-1 bg-white border rounded shadow-lg p-1 z-10"
          style={{
            top: `${toolbarPos.top}px`,
            left: `${toolbarPos.left}px`,
          }}
        >
          <button
            type="button"
            className="px-3 py-1.5 rounded text-sm hover:bg-zinc-100 font-bold"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("b")}
          >
            B
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded text-sm hover:bg-zinc-100 underline"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("u")}
          >
            U
          </button>
          <button
            type="button"
            className="px-3 py-1.5 rounded text-sm hover:bg-zinc-100 italic"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormat("i")}
          >
            I
          </button>
        </div>
      )}
      <div
        ref={ref}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        spellCheck={true}
        contentEditable
        suppressContentEditableWarning
        className="outline-none resize-none overflow-hidden text-zinc-600 text-[16px] leading-[24px] w-full min-h-[24px]"
        style={{
          position: !isInitialized ? "absolute" : "initial",
        }}
        aria-label="Rich Text Editor"
        data-placeholder="Type here or press / for commands"
      />

      {!isInitialized && (
        <div
          className="outline-none resize-none overflow-hidden text-zinc-600 text-[16px] leading-[24px] w-full min-h-[24px]"
          aria-hidden
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {(!content || ref.current?.textContent?.length === 0) && (
        <div
          className="pointer-events-none select-none absolute left-0 top-0 text-zinc-400 text-[16px] leading-[24px] w-full"
          style={{ userSelect: "none" }}
          aria-hidden="true"
        >
          Type here or press / for commands
        </div>
      )}
    </div>
  );
}
