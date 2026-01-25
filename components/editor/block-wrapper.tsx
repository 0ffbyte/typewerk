"use client";

import { useEditorStore } from "@/store/editor-store";
import { GripVerticalIcon, XIcon } from "lucide-react";

// dnd-kit
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  index: number;
  id: string;
};

const BlockWrapper = ({ children, index, id }: Props) => {
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);
  const addBlock = useEditorStore((state) => state.addBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const isSelected = selectedIndex === index;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: id });

  const draggableStyle: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 1000 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // shortcut for adding blocks
    if (e.altKey) {
      const key = e.key.toLowerCase();
      const insertAt = selectedIndex + 1;
      switch (key) {
        case "s":
          addBlock("section", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "w":
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
          const totalBlocks = useEditorStore.getState().data.blocks.length;
          if (index < totalBlocks - 1) {
            setSelectedIndex(index + 1);
          } else if (
            useEditorStore.getState().data.blocks[index].type !== "text"
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
      aria-activedescendant={isSelected ? "" : undefined}
      onKeyDown={handleKeyDown}
      onFocus={() => setSelectedIndex(index)}
      className="flex items-start justify-start relative w-full outline-none group"
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
        className="flex items-start justify-start relative w-full outline-none group"
        ref={setNodeRef}
        style={draggableStyle}
      >
        <div className="w-[92px] h-full absolute -left-[92px] top-0 flex items-start justify-end group pr-2">
          <div className="gap-1 hidden group-hover:flex">
            <button
              onClick={() => removeBlock(index)}
              className="hover:bg-zinc-200/50 rounded-[4px]"
            >
              <XIcon className="h-6 w-6 text-zinc-400" />
            </button>
            <button
              {...listeners}
              {...attributes}
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
