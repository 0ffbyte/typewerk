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
    <div
      title="Write"
      ref={setNodeRef}
      className="w-full h-[20] relative flex items-center group cursor-text hover:bg-zinc-200/50 transition-colors duration-200 delay-75 rounded"
      onClick={() => addBlock("text", index)}
    >
      <div
        className={cn(
          "w-full h-[4] transition-colors duration-100 rounded-full",
          isOver && "bg-blue-500"
        )}
      />
    </div>
  );
};

export default Spacer;
