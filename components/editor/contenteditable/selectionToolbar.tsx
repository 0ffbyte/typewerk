"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSelectionStore } from "@/store/selection-store";

import { cn } from "@/lib/utils";
import { unwrapSafe } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  BoldIcon,
  CheckCircleIcon,
  ChessKnightIcon,
  CodeIcon,
  CopyIcon,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  TextIcon,
  UnderlineIcon,
  WandSparklesIcon,
  AlertCircleIcon,
} from "lucide-react";
import { useEditorStore } from "@/store/editor-store";
import { BlockType } from "@/lib/block-registry";

type ToolbarPos = { x: number; y: number };

const BLOCK_ICON_MAPPING: Record<string, React.ReactNode> = {
  text: <TextIcon size={20} />,
  section: <TextIcon size={20} />,
  blockquote: <QuoteIcon size={20} />,
  checkmate: <ChessKnightIcon size={20} />,
  callout: <AlertCircleIcon size={20} />,
  code: <CodeIcon size={20} />,
  checklist: <CheckCircleIcon size={20} />,
};

const SelectionToolbar = ({
  ref,
  containerRef,
  blockId,
  allowFormatting = true,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  blockId: string;
  allowFormatting?: boolean;
}) => {
  const [toolbarPos, setToolbarPos] = useState<ToolbarPos | null>(null);
  const [foundTags, setFoundTags] = useState<string[]>([]);

  const { selection, tick, activeEditorId } = useSelectionStore();
  const isActive = activeEditorId === blockId;

  const selectedIndex = useEditorStore((s) => s.selectedIndex);
  const [blockType, setBlockType] = useState("text");

  const addBlock = useEditorStore((s) => s.addBlock);

  useEffect(() => {
    setBlockType(
      useEditorStore.getState().data.pages[useEditorStore.getState().pageIndex]
        .blocks[selectedIndex]?.type ?? "text"
    );
  }, [selectedIndex]);

  const toggleFormat = useCallback(
    (command: "bold" | "italic" | "underline" | "createLink") => {
      if (command === "createLink") {
        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const root =
          range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentNode!
            : range.commonAncestorContainer;

        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode(node) {
              return range.intersectsNode(node)
                ? NodeFilter.FILTER_ACCEPT
                : NodeFilter.FILTER_SKIP;
            },
          }
        );
        let node = walker.currentNode as Element;
        const toUnwrap: Element[] = [];

        while (node) {
          if (node.tagName?.toLowerCase() === "a") {
            toUnwrap.push(node);
          }

          node = walker.nextNode() as Element;
        }

        toUnwrap.forEach((node) => unwrapSafe(node));

        if (foundTags.includes("a")) {
          //console.log("unwrapped link");
        } else {
          //console.log("creating link");
          // create new link wrapping the cleaned content
          const linkElement = document.createElement("a");
          const url = window.prompt("Enter URL", "https://");
          linkElement.href = url || "https://artntek.co";
          linkElement.target = "_blank";
          linkElement.rel = "noopener noreferrer";
          linkElement.textContent = range.cloneContents().textContent;

          // replace the selection with the new link
          range.deleteContents();
          range.insertNode(linkElement);

          // move cursor to end of link
          range.setStartAfter(linkElement);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        return;
      }

      document.execCommand(command, false);
    },
    [foundTags]
  );

  const rewriteSelection = () => {
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const root =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentNode!
        : range.commonAncestorContainer;

    const preText = range.extractContents();
    const aiCompletion =
      "This is an ai completion demonstration, made by yours truly. Lorem ipsum dolor sit amet, lorem ipsum dolor.";
    const tokens = aiCompletion.split(" ");

    // create a psudo element
    const tempSpan = document.createElement("span");
    const spacer = document.createTextNode(" ");
    tempSpan.style.backgroundColor = "var(--color-pink-100)";
    tempSpan.style.borderRadius = "4px";
    tempSpan.style.padding = "0px 2px";
    tempSpan.style.border = "1px solid var(--color-pink-200)";
    tempSpan.style.color = "var(--color-pink-500)";
    tempSpan.id = "ai-completion";
    range.insertNode(tempSpan);

    let tokenIndex = 0;
    const intervalId = setInterval(() => {
      if (tokenIndex < tokens.length) {
        // Append next token to tempSpan.textContent
        tempSpan.textContent = tokens.slice(0, tokenIndex + 1).join(" ");
        range.setStartAfter(tempSpan);

        tokenIndex++;
      } else {
        clearInterval(intervalId);

        range.setStartAfter(tempSpan);
        range.selectNodeContents(tempSpan);
      }
    }, 100);

    range.insertNode(spacer);
    range.selectNodeContents(tempSpan);
    selection.removeAllRanges();
    selection.addRange(range);

    const inputEvent = new Event("input", { bubbles: true });
    ref.current?.dispatchEvent(inputEvent);
  };

  const acceptRewrite = () => {
    const completionEl = document.getElementById("ai-completion");
    if (!completionEl) return;

    // extract the text from the command span
    const text = completionEl.textContent;
    const replacementNode = document.createTextNode(text);

    // replace command span with a text node
    completionEl.replaceWith(replacementNode);

    const selection = ref.current?.ownerDocument.getSelection();
    const range = selection?.getRangeAt(0);
    if (!selection || !range) return;

    range.setStartAfter(replacementNode);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const declineRewrite = () => {
    const completionEl = document.getElementById("ai-completion");
    if (!completionEl) return;
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!isActive || !selection || !container) {
      setToolbarPos(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const root =
      range.commonAncestorContainer.nodeType === Node.TEXT_NODE
        ? range.commonAncestorContainer.parentNode!
        : range.commonAncestorContainer;

    let current = root instanceof Element ? root : root.parentElement;
    let foundTags = [];

    // walk up the DOM tree to find desired tags and stop at the root div parent
    while (current?.tagName !== "DIV" && current) {
      const foundTag = current.tagName.toLowerCase();
      const foundId = current.getAttribute("id");
      foundTags.push(foundTag);
      if (foundId) foundTags.push(foundId);
      current = current.parentElement;
    }

    setFoundTags(foundTags);

    const menuWidth = 354;
    const menuHeight = 48;

    // Initial x, y centered above selection anchor
    let x = rect.left - containerRect.left + rect.width / 2;
    let y = rect.top - containerRect.top - menuHeight;

    // Calculate intended menu boundaries relative to viewport
    let menuLeft = x - menuWidth / 2 + containerRect.left;
    let menuRight = menuLeft + menuWidth;
    let menuTop = y + containerRect.top;
    let menuBottom = menuTop + menuHeight;

    // Clamp horizontally within viewport
    if (menuLeft < 8) {
      x += 8 - menuLeft; // Shift right
    } else if (menuRight > window.innerWidth - 8) {
      x -= menuRight - (window.innerWidth - 8); // Shift left
    }

    // Clamp vertically: if above is not enough space, place below selection if possible
    if (menuTop < 8) {
      // Not enough space above, place below selection
      y = rect.bottom - containerRect.top + 8;
      menuTop = y + containerRect.top;
      menuBottom = menuTop + menuHeight;
      // (Optional) Clamp below as well
      if (menuBottom > window.innerHeight - 8) {
        y -= menuBottom - (window.innerHeight - 8);
      }
    }

    setToolbarPos({
      x,
      y,
    });
  }, [tick, selection, isActive]);

  if (!toolbarPos) return null;

  return (
    <div
      className="absolute flex items-center text-xs p-[4px] gap-[8px] h-[40px] rounded-lg shadow-md bg-zinc-900/80 border border-border/20 backdrop-blur-xs text-zinc-200 z-10 select-none"
      style={{
        left: toolbarPos.x,
        top: toolbarPos.y,
        transform: "translateX(-50%)",
      }}
    >
      <button
        className="hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          navigator.clipboard.writeText(selection?.toString() ?? "");
        }}
      >
        <CopyIcon size={20} />
      </button>

      {/* Shadcn Select for Block Types */}
      <div className="w-[100px]">
        <Select
          defaultValue={blockType}
          onValueChange={(value) => {
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            const extraction = range.extractContents();

            // preserve line breaks
            const div = document.createElement("div");
            div.appendChild(extraction);

            addBlock(value as BlockType, selectedIndex + 1, div.innerHTML);
            div.remove();

            // emit input event
            const inputEvent = new Event("input", { bubbles: true });
            ref.current?.dispatchEvent(inputEvent);
          }}
        >
          <SelectTrigger className="w-full h-8 text-xs border-none">
            <SelectValue placeholder="Select a block type" />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
            {Object.keys(BLOCK_ICON_MAPPING).map((blockType) => (
              <SelectItem key={blockType} value={blockType}>
                {BLOCK_ICON_MAPPING[blockType]}
                <span className="capitalize">{blockType}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {allowFormatting && (
        <>
          {foundTags.includes("ai-completion") ? (
            <>
              <button
                title="Accept"
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => acceptRewrite()}
              >
                Accept
              </button>

              <button
                title="Accept"
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => acceptRewrite()}
              >
                Decline
              </button>
            </>
          ) : (
            <>
              <div className="h-[32px] w-px bg-zinc-500" />

              <button
                title="Rewrite"
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]",
                  foundTags.includes("ai-completion") && "text-blue-500"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => rewriteSelection()}
              >
                <WandSparklesIcon size={20} />
              </button>

              <button
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]",
                  foundTags.includes("b") && "text-blue-500"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFormat("bold")}
              >
                <BoldIcon size={20} />
              </button>
              <button
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]",
                  foundTags.includes("i") && "text-blue-500"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFormat("italic")}
              >
                <ItalicIcon size={20} />
              </button>
              <button
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]",
                  foundTags.includes("u") && "text-blue-500"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFormat("underline")}
              >
                <UnderlineIcon size={20} />
              </button>
              <button
                className={cn(
                  "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-[12px]",
                  foundTags.includes("a") && "text-blue-500"
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleFormat("createLink")}
              >
                <LinkIcon size={20} />
              </button>
            </>
          )}
        </>
      )}

      {/* Bottom tip for the tooltip */}
      <svg
        className="absolute left-1/2 top-full -translate-x-1/2 pointer-events-none"
        width="16"
        height="9"
        viewBox="0 0 16 9"
        style={{ display: "block" }}
      >
        {/* Border layer */}
        <path
          d="M1,0 Q1,0 8,9 Q15,0 15,0"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Fill layer */}
        <path
          d="M1,0 Q1,0 8,8 Q15,0 15,0"
          fill="rgb(24,24,27)"
          opacity="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SelectionToolbar;
