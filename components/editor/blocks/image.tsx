import type { BlockProps } from "@/app/types";
import { useRef } from "react";
import useFocused from "@/hooks/use-focused";
import { useEditorStore } from "@/store/editor-store";

// define block props
export type Props = BlockProps & {
  url: string;
};

// define block component
const ImageBlock = ({ url, index }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useFocused(ref, index);

  return (
    <div
      ref={ref}
      tabIndex={index}
      className="w-full aspect-video border relative overflow-hidden outline-none bg-zinc-200 rounded-[8] group"
    >
      <img className="w-full h-full object-cover" src={url ?? ""} />
      <ImageToolbar index={index} />
    </div>
  );
};

export default ImageBlock;

const ImageToolbar = ({ index }: { index: number }) => {
  const setState = useEditorStore((state) => state.setState);

  const handleUpdateUrl = () => {
    const newUrl = window.prompt("Enter image URL:", "");
    if (newUrl !== null && newUrl.trim() !== "") {
      setState((draft) => {
        const block = draft.data.blocks[index];
        if (block && block.type === "image") {
          block.props.url = newUrl.trim();
        }
      });
    }
  };

  return (
    <div className="absolute top-2 right-2 bg-zinc-800 text-zinc-100 rounded-md p-1 text-xs hidden items-center justify-start gap-1 group-hover:flex">
      <button onClick={handleUpdateUrl}>Update URL</button>
    </div>
  );
};
