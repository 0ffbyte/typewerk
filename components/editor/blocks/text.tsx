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

  const handleInput = (e: React.ChangeEvent<HTMLDivElement>) => {
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

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only get plain text from clipboard, ignoring all HTML
    const text = e.clipboardData?.getData("text/plain");
    if (!text) return;

    // Insert the plain text at the caret position
    if (document.getSelection && ref.current) {
      const selection = document.getSelection();
      if (!selection) return;

      // Remove whatever is currently selected
      if (!selection.isCollapsed) {
        selection.deleteFromDocument();
      }

      // Create a text node to insert
      const textNode = document.createTextNode(text);

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(textNode);

        // Move caret to after inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        // Update the block's content with just the plain text (avoiding unwanted HTML)
        setState((s) => {
          const block = s.data.blocks[index];
          if (block.type === "text") {
            // Get the full plain text content after pasting
            block.props.content = ref.current?.textContent ?? "";
          }
        });
      }
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

  const handleOnBlur = () => {
    if (ref.current) {
      const content = ref.current.textContent ?? "";
      if (content.length === 0) removeBlock(index);
    }
  };

  return (
    <ContentEditable
      ref={ref}
      content={content}
      placeholder="Type here or press / for commands"
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleOnBlur}
      onPaste={handlePaste}
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
