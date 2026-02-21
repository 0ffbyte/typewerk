"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";
import type { BlockProps } from "@/app/types";
import { CropIcon, UploadIcon, TrashIcon } from "@radix-ui/react-icons";

// define block props
export type ImageProps = {
  url: string;
};

// define block component
const ImageBlock = ({ url, index }: ImageProps & BlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const { isFocused } = useFocused(ref, index);

  const isToolbarVisible = isFocused || isMouseOver;

  return (
    <div
      ref={ref}
      tabIndex={index}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="w-full aspect-video border relative overflow-hidden outline-none bg-zinc-100 rounded-lg group"
    >
      <img className="w-full h-full object-cover" src={url ?? ""} />
      {isToolbarVisible && <ImageToolbar index={index} />}
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
    <div className="absolute top-1 right-1 gap-1 flex items-center justify-start">
      <div className="h-[32px] border border-white/20 aspect-square rounded-sm bg-zinc-950/80 flex items-center justify-center backdrop-blur-xs gap-1">
        <button
          title="Upload"
          onClick={() => handleUpdateUrl()}
          className="h-full aspect-square flex items-center justify-center"
        >
          <UploadIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75 w-4 h-4" />
        </button>

        <button
          title="Crop"
          className="h-full aspect-square flex items-center justify-center"
        >
          <CropIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75 w-4 h-4" />
        </button>
      </div>

      <div className="h-[32px] border border-white/20 aspect-square rounded-sm bg-zinc-950/80 flex items-center justify-center gap-2 backdrop-blur-xs">
        <button
          title="Delete"
          onClick={() => removeBlock(index)}
          className="h-full aspect-square flex items-center justify-center"
        >
          <TrashIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
