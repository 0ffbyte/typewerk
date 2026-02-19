"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { GripVerticalIcon } from "lucide-react";

// dnd-kit
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

import type { BlockProps } from "@/app/types";

type Props = {
  children: React.ReactNode;
};

const BlockWrapper = ({ children, index, id }: Props & BlockProps) => {
  const state = useEditorStore((state) => state);
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);
  const addBlock = useEditorStore((state) => state.addBlock);
  const pageIndex = useEditorStore((state) => state.pageIndex);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const preventNewLine = useEditorStore((state) => state.preventNewLine);
  const isSelected = selectedIndex === index;

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelected && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [preventNewLine, isSelected]);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: id });

  const draggableStyle: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // shortcut for adding blocks
    if (e.altKey) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      const insertAt = selectedIndex + 1;
      switch (key) {
        case "s":
          addBlock("section", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "t":
          addBlock("text", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "i":
          addBlock("image", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "b":
          addBlock("blockquote", insertAt);
          setSelectedIndex(insertAt);
          break;
        default:
          break;
      }
    }
    // handle block traversal
    else if (e.ctrlKey) {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (index >= 0) {
            setSelectedIndex(index - 1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          const totalBlocks = state.data.pages[pageIndex].blocks.length;
          if (index < totalBlocks - 1) {
            setSelectedIndex(index + 1);
          } else if (
            state.data.pages[pageIndex].blocks[index].type !== "text"
          ) {
            addBlock("text", index + 1);
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      aria-activedescendant={isSelected ? "" : undefined}
      onKeyDown={handleKeyDown}
      onFocus={() => setSelectedIndex(index)}
      className={cn(
        "flex items-start justify-start relative w-full outline-none group p-[4px] transition-all duration-200 border-b border-transparent",
        preventNewLine && !isSelected && "blur-xs opacity-80",
        "hover:border-border"
      )}
    >
      <div
        id="block-placeholder"
        aria-hidden="true"
        className={cn(
          "w-full h-full absolute top-0 left-0 transition-colors duration-200 rounded-[8]",
          isDragging && "bg-zinc-200"
        )}
      />

      <div
        className="flex items-start justify-start relative w-full outline-none group transition-opacity duration-200"
        style={draggableStyle}
        ref={setNodeRef}
      >
        <div className="w-[92px] h-full absolute -left-[92px] top-0 flex items-start justify-end group pr-[8px]">
          <div className="gap-1 opacity-0 group-hover:opacity-100 flex">
            <button
              {...listeners}
              {...attributes}
              ref={setActivatorNodeRef}
              className="hover:bg-zinc-200/50 rounded-[4px]"
            >
              <GripVerticalIcon className="h-6 w-6 text-zinc-400" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default BlockWrapper;

/**
 * Plus
 * 
 *    <Combobox items={blocks}>
              <ComboboxTrigger
                render={
                  <button className="hover:bg-zinc-200/50 rounded-[4px]">
                    <PlusIcon className="size-6 text-zinc-400" />
                  </button>
                }
              />
              <ComboboxContent align="end" className="w-full rounded-[20px]">
                <ComboboxInput
                  showTrigger={false}
                  placeholder="Search"
                  className="rounded-full"
                />
                <ComboboxEmpty>No blocks found.</ComboboxEmpty>
                <ComboboxList>
                  {(item) => (
                    <ComboboxItem
                      key={item.code}
                      value={item}
                      onClick={() => addBlock(item.code, index + 1)}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-6 w-6 text-zinc-400" />
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
 */
