"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";
import type { BlockProps } from "@/app/types";

// define block props
export type ImageProps = {
  url: string;
};

// define block component
const ImageBlock = ({ url, index }: ImageProps & BlockProps) => {
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
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const handleUpdateUrl = () => {
    const newUrl = window.prompt("Enter image URL:", "");
    if (newUrl !== null && newUrl.trim() !== "") {
      setState((s) => {
        const block = s.data.pages[s.pageIndex].blocks[index];
        if (block && block.type === "image") {
          block.props.url = newUrl.trim();
        }
      });
    }
  };

  return (
    <div className="absolute top-2 right-2 bg-zinc-800 text-zinc-100 rounded-md px-2 py-1 text-xs hidden items-center justify-start gap-2 group-hover:flex">
      <button onClick={handleUpdateUrl}>Update URL</button>
      <div className="h-[12] w-[1] bg-zinc-500" />
      <button onClick={() => removeBlock(index)} className="text-rose-400">
        Del
      </button>
    </div>
  );
};
