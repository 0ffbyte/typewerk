import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import sanitizeHtml from "sanitize-html";
import ContentEditable from "../contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";

// define block props
export type Props = BlockProps & {
  content: string;
};

// define block component
const BlockquoteBlock = ({ content, index }: Props) => {
  const setState = useEditorStore((state) => state.setState);
  const ref = useRef<HTMLDivElement>(null);
  useFocused(ref, index);

  const handleInput = () => {
    if (ref.current) {
      setState((s) => {
        const block = s.data.blocks[index];
        if (block.type === "blockquote") {
          const sanizitedContent = sanitizeHtml(ref.current?.innerHTML ?? "", {
            allowedTags: ["b", "u", "i", "strong", "em", "br", "a", "p"],
          });
          block.props.content = sanizitedContent;
        }
      });
    }
  };

  return (
    <blockquote className="border-l-4 border-zinc-400 pl-4 text-zinc-600 text-[20px] leading-[28px] w-full min-h-[20px]">
      <ContentEditable ref={ref} content={content} onInput={handleInput} />
    </blockquote>
  );
};

export default BlockquoteBlock;
