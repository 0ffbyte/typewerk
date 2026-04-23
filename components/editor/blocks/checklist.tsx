"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable/contenteditable";
import { moveCaretToEnd, THEME_MAPPING, cn } from "@/lib/utils";

type Item = {
  id: string;
  content: string;
  checked: boolean;
};

export type ChecklistProps = {
  items: Item[];
};

const ChecklistBlock = ({
  items,
  index,
  id: blockId,
}: ChecklistProps & BlockProps) => {
  const setState = useEditorStore((s) => s.setState);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);

  const isBlockSelected = index === selectedIndex;

  const theme = useEditorStore((s) => s.data.theme);

  const updateItem = (
    idx: number,
    content: string | null,
    checked: boolean
  ) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks.find(
        (b) => b.id === blockId
      );
      if (!block || block.type !== "checklist") return;
      if (content != null) block.props.items[idx].content = content;
      block.props.items[idx].checked = checked;
    });
  };

  const addItem = () => {
    const insertAt = currentIndex + 1;
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks.find(
        (b) => b.id === blockId
      );
      if (!block || block.type !== "checklist") return;
      block.props.items.splice(insertAt, 0, {
        id: crypto.randomUUID(),
        content: "",
        checked: false,
      });
    });
    setCurrentIndex(insertAt);
  };

  const removeItem = (itemIdx: number) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks.find(
        (b) => b.id === blockId
      );
      if (!block || block.type !== "checklist") return;
      block.props.items.splice(itemIdx, 1);
    });

    setCurrentIndex(Math.max(0, itemIdx - 1));
  };

  // focus handler
  useEffect(() => {
    const el = itemRefs.current.get(currentIndex);
    if (el && isBlockSelected) {
      el.focus();
      moveCaretToEnd(el);
    }
  }, [currentIndex, isBlockSelected]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter") {
        console.log("enter");
        const el = itemRefs.current.get(currentIndex);
        const nextEl = itemRefs.current.get(currentIndex + 1);
        const textContent = el?.textContent || "";

        if (nextEl && nextEl.textContent.length === 0) {
          e.preventDefault();
          nextEl.focus();
          setCurrentIndex(currentIndex + 1);
        } else if (textContent.length > 0) addItem();
      } else if (e.key === "Backspace") {
        const el = itemRefs.current.get(currentIndex);
        const textContent = el?.textContent || "";
        const isListEmpty = itemRefs.current.size <= 1;

        if (textContent.length === 0) {
          e.preventDefault();
          e.stopPropagation();
          removeItem(currentIndex);

          if (isListEmpty) removeBlock(index);
        }
      } else if (e.key === "ArrowUp") {
        if (currentIndex > 0) {
          e.preventDefault();
          setCurrentIndex(currentIndex - 1);
          const prevEl = itemRefs.current.get(currentIndex - 1);
          prevEl?.focus();
        }
      } else if (e.key === "ArrowDown") {
        if (currentIndex < items.length - 1) {
          e.preventDefault();
          setCurrentIndex(currentIndex + 1);
          const nextEl = itemRefs.current.get(currentIndex + 1);
          nextEl?.focus();
        }
      }
    },
    [currentIndex, itemRefs, items.length]
  );

  return (
    <div
      ref={containerRef}
      className="w-full space-y-1 select-none"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="flex items-start gap-3"
          onFocus={() => setCurrentIndex(idx)}
        >
          <input
            className={cn(
              "h-5 w-5 mt-[6px] border-zinc-200 bg-transparent rounded-md cursor-pointer"
            )}
            style={{
              accentColor: THEME_MAPPING.accent[theme?.accent],
            }}
            type="checkbox"
            checked={item.checked}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateItem(idx, null, e.target.checked)
            }
          />

          <ContentEditable
            blockIndex={index}
            className={cn(item.checked && "line-through")}
            id={item.id + "-content"}
            ref={(el: HTMLDivElement) => {
              if (el) itemRefs.current.set(idx, el);
              else itemRefs.current.delete(idx);
            }}
            placeholder="Type here"
            multiLine={false}
            value={item.content}
            onEdit={(v) => updateItem(idx, v, item.checked)}
          />
        </div>
      ))}
    </div>
  );
};

export default ChecklistBlock;
