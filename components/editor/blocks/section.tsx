import { useEditorStore } from "@/store/editor-store"; // access editor
import type { BlockProps } from "@/app/types";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

// define block props
export type Props = BlockProps & {
  title: string;
};

// define block component
const SectionBlock = ({ title = "", index }: Props) => {
  const setState = useEditorStore((state) => state.setState);
  const addBlock = useEditorStore((state) => state.addBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const ref = useRef<HTMLInputElement>(null);
  useFocused(ref, index);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBlock("text", index + 1);
    } else if (e.key === "Backspace" && (title ?? "").length === 0) {
      removeBlock(index);
    }
  };

  return (
    <input
      id={title}
      ref={ref}
      className="text-[24px] w-full leading-0 font-semibold outline-none placeholder:text-zinc-400"
      placeholder="Section"
      maxLength={30}
      value={title}
      onKeyDown={handleKeyDown}
      onChange={(e) => {
        setState((s) => {
          const block = s.data.blocks[index];
          if (block.type === "section") {
            block.props.title = e.target.value;
          }
        });
      }}
    />
  );
};

export default SectionBlock;
