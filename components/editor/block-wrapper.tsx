"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";

// dnd-kit
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

import type { BlockProps } from "@/app/types";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { useSelectionStore } from "@/store/selection-store";

type Props = {
  children: React.ReactNode;
};

const BlockWrapper = ({ children, index, id }: Props & BlockProps) => {
  const state = useEditorStore((state) => state);
  const isSelected = state.selectedIndex === index;
  const isSelecting = useSelectionStore((s) => s.meta.isSelecting);

  const containerRef = useRef<HTMLDivElement>(null);

  // dnd-kit
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
    zIndex: isDragging ? 99 : undefined,
    transition: "transform 0.2s ease-out",
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // shortcut for adding blocks
    if (e.altKey) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      const insertAt = state.selectedIndex + 1;
      switch (key) {
        case "s":
          state.addBlock("section", insertAt);
          state.setSelectedIndex(insertAt);
          break;
        case "t":
          state.addBlock("text", insertAt);
          state.setSelectedIndex(insertAt);
          break;
        case "i":
          state.addBlock("image", insertAt);
          state.setSelectedIndex(insertAt);
          break;
        case "b":
          state.addBlock("blockquote", insertAt);
          state.setSelectedIndex(insertAt);
          break;
        case "c":
          state.addBlock("code", insertAt);
          state.setSelectedIndex(insertAt);
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
            state.setSelectedIndex(index - 1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          const totalBlocks = state.data.pages[state.pageIndex].blocks.length;
          if (index < totalBlocks - 1) {
            state.setSelectedIndex(index + 1);
          } else if (
            state.data.pages[state.pageIndex].blocks[index].type !== "text"
          ) {
            state.addBlock("text", index + 1);
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
      onFocus={() => state.setSelectedIndex(index)}
      className={cn(
        "flex items-start justify-start hover:border-border relative w-full outline-none group p-[4px] transition-all duration-200 border-b border-transparent pointer-events-auto",
        state.preventNewLine &&
          !isSelected &&
          "blur-xs opacity-80 pointer-events-none"
      )}
      onPointerDown={() => {
        state.setState((s) => {
          s.isEditable = true;
        });
      }}
      onPointerLeave={() => {
        if (!isSelecting) return;
        state.setState((s) => {
          s.isEditable = false;
        });
      }}
    >
      <div
        id="block-placeholder"
        aria-hidden="true"
        className={cn(
          "w-full h-full absolute top-0 left-0 transition-colors duration-200 rounded-[8]",
          isDragging && "bg-zinc-500/10"
        )}
      />

      <div
        className="flex items-start justify-start relative w-full outline-none group transition-opacity duration-200"
        style={draggableStyle}
      >
        <div
          ref={setNodeRef}
          aria-hidden="true"
          className={cn(
            "h-[32px] w-full absolute left-0 top-0 flex-1 z-99 pointer-events-none"
          )}
        />
        <div className="w-[92px] h-full absolute -left-[92px] top-0 flex items-start justify-end group pr-[8px]">
          <div
            className={cn(
              "gap-1 flex",
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <button
              {...listeners}
              {...attributes}
              ref={setActivatorNodeRef}
              className={cn(
                "rounded-[4px]",
                !isDragging && "hover:bg-zinc-500/10"
              )}
              style={{
                rotate: isDragging ? "-1deg" : undefined,
              }}
            >
              <DragHandleDots2Icon className="h-6 w-6 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div
          className="w-full h-full transition-all duration-200"
          style={{
            rotate: isDragging ? "1deg" : undefined,
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          {children}
        </div>
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
