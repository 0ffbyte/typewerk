"use client";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  index: number;
  className?: string;
};

const Spacer = ({ id, index }: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const addBlock = useEditorStore((state) => state.addBlock);

  return (
    <div className="w-full h-[8] relative flex items-center" ref={setNodeRef}>
      <div
        className={cn(
          "w-full h-[4] transition-colors duration-200 rounded-full",
          isOver && "bg-blue-500/50"
        )}
      />
    </div>
  );
};

export default Spacer;
