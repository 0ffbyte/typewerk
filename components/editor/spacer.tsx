"use client";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  index?: number;
  className?: string;
};

const Spacer = ({ id }: Props) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        "h-[4] w-full my-[12] relative transition-colors duration-200 rounded-full",
        isOver && "bg-blue-500/50"
      )}
      ref={setNodeRef}
    />
  );
};

export default Spacer;
