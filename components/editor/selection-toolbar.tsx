"use client";
// selection toolbar 2.0
import { useShallow } from "zustand/shallow";
import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useSelectionStore } from "@/store/selection-store";
import { useEditorStore } from "@/store/editor-store";
import useAppStore from "@/store/app-store";

import {
  cn,
  unwrapSafe,
  getFoundTags,
  getAttributeFromNode,
} from "@/lib/utils";
import {
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  Link2Icon as LinkIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { useIsMobile } from "@/hooks/use-mobile";

const SelectionToolbar = () => {
  const blocks = useEditorStore(
    useShallow((s) => s.data.pages[s.pageIndex].blocks)
  );
  const setState = useEditorStore((s) => s.setState);
  const {
    selection,
    position,
    meta: {
      isSelecting,
      isMultiSelection,
      anchorIndex,
      tailIndex,
      activeEditorIds,
    },
  } = useSelectionStore();
  const ref = useRef<HTMLDivElement>(null);
  const setSonner = useAppStore((s) => s.setSonner);

  const isMobile = useIsMobile();
  const [tick, setTick] = useState(0);

  // Derive foundTags from selection
  const foundTags = useMemo(() => {
    return getFoundTags(selection);
  }, [tick, position, anchorIndex]);

  const allowFormatting = useMemo(() => {
    return Array.from(
      document.querySelectorAll("[data-class='editor-contenteditable']")
    )
      .filter((e) => activeEditorIds.includes(e.id))
      .some(
        (el) => getAttributeFromNode(el, "data-allow-formatting") === "true"
      );
  }, [activeEditorIds]);

  const anchorBlockType = useMemo(() => {
    return blocks[anchorIndex]?.type || blocks[tailIndex]?.type;
  }, [anchorIndex]);

  const toggleFormat = useCallback(
    (command: "bold" | "italic" | "underline" | "createLink") => {
      setTick((prev) => prev + 1);
      if (command === "createLink") {
        const domSelection = document.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) return;

        const range = domSelection.getRangeAt(0);
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
          if (node.tagName?.toLowerCase() === "a") toUnwrap.push(node);
          node = walker.nextNode() as Element;
        }

        toUnwrap.forEach((n) => unwrapSafe(n));

        if (!foundTags.includes("a")) {
          const linkElement = document.createElement("a");
          const url = window.prompt("Enter URL", "https://");
          if (!url) return;
          linkElement.href = url;
          linkElement.target = "_blank";
          linkElement.rel = "noopener noreferrer";
          linkElement.textContent = range.cloneContents().textContent;

          range.deleteContents();
          range.insertNode(linkElement);

          range.setStartAfter(linkElement);
          range.collapse(true);
          domSelection.removeAllRanges();
          domSelection.addRange(range);
        }

        return;
      }

      document.execCommand(command, false);
    },
    [foundTags]
  );

  if (!selection || isSelecting || isMobile || !activeEditorIds.length)
    return null;

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.1,
        type: "spring",
        stiffness: 450,
        damping: 24,
        mass: 0.8,
      }}
      className="absolute z-50 rounded-lg shadow-lg border border-border/20 bg-zinc-900/80 text-xs p-1 h-[36px] flex items-center justify-center gap-0.5 backdrop-blur-xs text-zinc-400 select-none"
      style={{
        left: position.x - (allowFormatting ? 148 : 100),
        top: position.y - 44,
        transformOrigin: "center",
        transform: "translate(100%, -100%)",
        pointerEvents: "auto",
        willChange: "transform",
      }}
      onPointerEnter={() => {
        if (isMultiSelection) return;
        setState((s) => (s.isEditable = true));
      }}
    >
      <button
        title="copy"
        className={cn(
          "hover:text-zinc-300 h-full aspect-square flex items-center justify-center rounded-sm"
        )}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          navigator.clipboard.writeText(selection?.toString() ?? "");
          setSonner({
            title: "Copied",
            message: "Text copied to clipboard",
          });
        }}
      >
        <CopyIcon />
      </button>

      <SelectionSelectSwap
        selection={selection}
        anchorBlockType={anchorBlockType}
      />
      {allowFormatting && !isMultiSelection && (
        <>
          <button
            className={cn(
              "hover:text-zinc-300 h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("b") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("bold")}
          >
            <FontBoldIcon />
          </button>

          <button
            className={cn(
              "hover:text-zinc-300 h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("i") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("italic")}
          >
            <FontItalicIcon />
          </button>

          <button
            className={cn(
              "hover:text-zinc-300 h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("u") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("underline")}
          >
            <UnderlineIcon />
          </button>

          <button
            className={cn(
              "hover:text-zinc-300 h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("a") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("createLink")}
          >
            <LinkIcon />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-zinc-400/30 mx-0.5" />

      <button
        className={cn(
          "hover:bg-rose-50/10 h-full flex items-center w-18 px-2 gap-1 justify-center rounded-sm text-sm text-zinc-400 hover:text-zinc-300"
        )}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() =>
          alert(
            `AI features not yet implemented. \nSelection: "${selection?.toString()}"`
          )
        }
      >
        Ask AI
      </button>

      <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 h-3 w-3 bg-zinc-800 rotate-45 rounded-br-[4px] hidden" />
    </motion.div>
  );
};

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TextIcon,
  QuoteIcon,
  HeadingIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import { BlockType } from "@/lib/block-registry";

const BLOCK_ICON_MAPPING: Record<string, React.ReactNode> = {
  text: <TextIcon color="var(--color-zinc-400)" />,
  section: <TextIcon color="var(--color-zinc-400)" />,
  blockquote: <QuoteIcon color="var(--color-zinc-400)" />,
  checkmate: <HeadingIcon color="var(--color-zinc-400)" />,
  callout: <ExclamationTriangleIcon color="var(--color-zinc-400)" />,
  code: <CodeIcon color="var(--color-zinc-400)" />,
  checklist: <CheckCircledIcon color="var(--color-zinc-400)" />,
};

const SelectionSelectSwap = ({
  selection,
  anchorBlockType,
}: {
  selection: Selection;
  anchorBlockType: string;
}) => {
  const addBlock = useEditorStore((s) => s.addBlock);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);

  return (
    <div className="w-[100x]">
      <Select
        defaultValue={anchorBlockType}
        onValueChange={(value) => {
          if (!selection || selection.rangeCount === 0) return;

          const range = selection.getRangeAt(0);
          const extraction = range.extractContents();

          // preserve line breaks
          const div = document.createElement("div");
          div.appendChild(extraction);

          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          addBlock(value as BlockType, selectedIndex, div.innerText);
          div.remove();
        }}
      >
        <SelectTrigger className="text-sm border-none w-full px-2">
          <SelectValue placeholder="Select a block type" />
        </SelectTrigger>
        <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
          {Object.keys(BLOCK_ICON_MAPPING).map((blockType) => (
            <SelectItem key={blockType} value={blockType}>
              <span className="capitalize">{blockType}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectionToolbar;
