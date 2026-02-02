"use client";
import { useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";
import type { BlockProps } from "@/app/types";
import ContentEditable from "../contenteditable";
import useFocused from "@/hooks/use-focused";

export type TextProps = {
  content: string;
};

export default function TextBlock({ content, index }: TextProps & BlockProps) {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);

  const { isFocused } = useFocused(ref, index);

  useEffect(() => {
    if (!isFocused && content.length === 0) {
      removeBlock(index);
    }
  }, [isFocused]);

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
      if (block.type === "text") {
        block.props.content = v;
      }
    });
  };

  return (
    <ContentEditable
      ref={ref}
      value={content}
      onEdit={handleEdit}
      onKeyDown={handleKeyDown}
      placeholder="Type here or press / for commands"
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
