"use client";

import { useRef } from "react";
import ContentEditable from "../contenteditable";
import { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";

export type CheckmateProps = {
  content: string;
};

const CheckmateBlock = ({
  content,
  index,
  id,
}: CheckmateProps & BlockProps) => {
  const setState = useEditorStore((s) => s.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);

  useFocused(ref, index);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      console.log("backspace");
      if (ref.current?.textContent?.length === 0) {
        e.preventDefault();
        removeBlock(index);
      }
    }
  };

  return (
    <div onKeyDown={handleKeyDown} className="w-full">
      <ContentEditable
        id={id}
        ref={ref}
        className="font-sans text-foreground text-[42px] leading-[48px] font-bold"
        value={content}
        onEdit={(v) =>
          setState((s) => {
            const block = s.data.pages[s.pageIndex].blocks[index];
            if (block.type === "checkmate") {
              block.props.content = v;
            }
          })
        }
        placeholder="Checkmate"
      />
    </div>
  );
};

export default CheckmateBlock;
