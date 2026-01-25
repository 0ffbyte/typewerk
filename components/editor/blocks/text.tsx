"use client";
import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import type { BlockProps } from "@/app/types";
import sanitizeHtml from "sanitize-html";
import ContentEditable from "../contenteditable";
import useFocused from "@/hooks/use-focused";

export type Props = BlockProps & {
  content: string;
};

export default function TextBlock({ content, index }: Props) {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);

  useFocused(ref, index);

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
    if (e.key === "Enter") {
      e.preventDefault();

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);

      // Check if selection is within our editor
      if (!ref.current?.contains(range.commonAncestorContainer)) {
        return;
      }

      // Insert br tag manually
      const br = document.createElement("br");
      range.deleteContents();
      range.insertNode(br);

      // Move cursor after the br
      range.setStartAfter(br);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      // Trigger input event to update state
      const inputEvent = new Event("input", { bubbles: true });
      ref.current?.dispatchEvent(inputEvent);
    } else if (e.key === "Backspace") {
      if (
        ref.current?.textContent?.length === 0 &&
        ref.current?.innerHTML?.length <= 4
      ) {
        e.preventDefault();
        removeBlock(index);
      }
    }
  };

  return (
    <ContentEditable
      ref={ref}
      content={content}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
    />
  );
}

/**
 * const applyFormat = (tag: string) => {
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

    // Trigger input event to update state
    const inputEvent = new Event("input", { bubbles: true });
    ref.current?.dispatchEvent(inputEvent);
  };
 */
