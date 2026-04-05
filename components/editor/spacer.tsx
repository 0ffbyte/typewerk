"use client";
import { useDroppable } from "@dnd-kit/core";
import { useEditorStore } from "@/store/editor-store";
import { cn, THEME_MAPPING } from "@/lib/utils";

type Props = {
  id: string;
  index: number;
  className?: string;
};

const Spacer = ({ id, index }: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });
  const theme = useEditorStore((s) => s.data.theme);
  const addBlock = useEditorStore((state) => state.addBlock);
  return (
    <div
      title="Write"
      ref={setNodeRef}
      className="w-full h-[16] relative flex items-center group cursor-text hover:bg-zinc-200/0 transition-colors duration-200 delay-75 rounded select-none"
      onClick={() => addBlock("text", index)}
    >
      <div
        className={cn(
          "w-full h-[4] transition-colors duration-200 rounded-full"
        )}
        style={{
          backgroundColor: isOver
            ? THEME_MAPPING.accent[theme?.accent || "blue"]
            : "transparent",
        }}
      />
    </div>
  );
};

export default Spacer;
