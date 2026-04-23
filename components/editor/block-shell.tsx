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

const BlockShell = ({ children, index, id }: Props & BlockProps) => {
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
    zIndex: isDragging ? 99 : undefined,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: transform ? "transform 0.2s ease-out" : "transform 0s",
  };

  return (
    <div
      key={id}
      ref={containerRef}
      aria-activedescendant={isSelected ? "" : undefined}
      onFocus={() => state.setSelectedIndex(index)}
      className={cn(
        "flex items-start justify-start hover:border-border border-dotted relative w-full outline-none group p-[4px] transition-all duration-100 border-b border-transparent pointer-events-auto",
        state.preventNewLine &&
          !isSelected &&
          "blur-xs opacity-80 scale-99 pointer-events-none"
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
          isDragging && "bg-card/40"
        )}
      />

      <div
        className="flex items-start justify-start relative w-full outline-none group transition-opacity duration-200"
        style={draggableStyle}
      >
        <div
          ref={setNodeRef}
          aria-hidden
          className={cn(
            "h-[40px] w-full absolute left-0 top-0 flex-1 z-99 pointer-events-none"
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
              <DragHandleDots2Icon className="h-6 w-6 text-muted-foreground/40" />
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

export default BlockShell;

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
