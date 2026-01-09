import { useEditorStore } from "@/store/editor-store"; // access editor
import type { BlockProps } from "@/app/types";
import useFocus from "@/hooks/use-focus";
import { useEffect } from "react";

// define block props
export type Props = BlockProps & {
  title: string;
};

// define block component
const SectionBlock = ({ title = "", index }: Props) => {
  const { ref, isFocused } = useFocus(index);
  const setState = useEditorStore((state) => state.setState);
  const addBlock = useEditorStore((state) => state.addBlock);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  // Move caret to the end position of input element
  useEffect(() => {
    if (isFocused && ref.current) {
      const el = ref.current;

      const length = el.value.length;
      el.setSelectionRange(length, length);
    }
  }, [isFocused]);

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
      ref={ref}
      className="text-[16px] w-full leading-0 font-medium outline-none placeholder:text-zinc-400"
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
