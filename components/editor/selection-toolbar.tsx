// selection toolbar 2.0
import { useCallback, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useSelectionStore } from "@/store/selection-store";

import { cn, unwrapSafe, getFoundTags } from "@/lib/utils";
import { BoldIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react";

const SelectionToolbar = () => {
  const selection = useSelectionStore((s) => s.selection);
  const position = useSelectionStore((s) => s.position);
  const isSelecting = useSelectionStore((s) => s.meta.isSelecting);
  const isMultiSelection = useSelectionStore((s) => s.meta.isMultiSelection);
  const anchorIndex = useSelectionStore((s) => s.meta.anchorIndex);

  const [tick, setTick] = useState(0);

  // Derive foundTags from selection
  const foundTags = useMemo(() => {
    return getFoundTags(selection);
  }, [tick, position, anchorIndex]);

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

  if (!selection || isSelecting) return null;

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.1,
        type: "spring",
        stiffness: 450,
        damping: 24,
        mass: 0.8,
      }}
      className="absolute z-50 rounded-lg shadow-md bg-zinc-800 text-xs p-1 h-[38px] flex items-center justify-center gap-0.5 backdrop-blur-xs text-zinc-200 select-none"
      style={{
        left: position.x - 76,
        top: position.y - 48,
        transformOrigin: "center",
        transform: "translate(100%, -100%)",
        pointerEvents: "auto",
        willChange: "transform",
      }}
    >
      {isMultiSelection ? (
        <p>Multi</p>
      ) : (
        <>
          <button
            className={cn(
              "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("b") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("bold")}
          >
            <BoldIcon size={14} />
          </button>

          <button
            className={cn(
              "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("i") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("italic")}
          >
            <ItalicIcon size={14} />
          </button>

          <button
            className={cn(
              "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("u") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("underline")}
          >
            <UnderlineIcon size={14} />
          </button>

          <div className="w-px h-4 bg-zinc-600/60 mx-0.5" />

          <button
            className={cn(
              "hover:bg-zinc-50/10 transition-colors h-full aspect-square flex items-center justify-center rounded-sm",
              foundTags.includes("a") && "text-blue-400"
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => toggleFormat("createLink")}
          >
            <LinkIcon size={14} />
          </button>
        </>
      )}

      <div className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 h-3 w-3 bg-zinc-800 rotate-45 rounded-br-[4px]" />
    </motion.div>
  );
};

export default SelectionToolbar;
