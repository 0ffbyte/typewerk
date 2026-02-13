"use client";

import { useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";
import type { BlockProps } from "@/app/types";
import { CropIcon, Settings2Icon, UploadIcon, XIcon } from "lucide-react";

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
      className="w-full aspect-video border relative overflow-hidden outline-none bg-zinc-100 rounded-[16] group"
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
    <div className="absolute top-1 right-1 gap-1 flex items-center justify-start group-hover:opacity-100 opacity-0 transition-opacity duration-200">
      <div className="h-[36px] aspect-square rounded-[12px] bg-zinc-50/80 flex items-center justify-center gap-2 backdrop-blur-xs px-1">
        <button
          title="Upload"
          onClick={() => handleUpdateUrl()}
          className="h-[32px] aspect-square flex items-center justify-center"
        >
          <UploadIcon
            size={24}
            className="text-zinc-400 hover:text-zinc-500 transition-colors duration-200"
          />
        </button>

        <div className="w-px h-[24px] bg-zinc-950/10" />

        <button
          title="Crop"
          onClick={() => removeBlock(index)}
          className="h-[32px] aspect-square flex items-center justify-center"
        >
          <CropIcon
            size={24}
            className="text-zinc-400 hover:text-zinc-500 transition-colors duration-200"
          />
        </button>

        <button
          title="Image settings"
          onClick={() => removeBlock(index)}
          className="h-[32px] aspect-square flex items-center justify-center"
        >
          <Settings2Icon
            size={24}
            className="text-zinc-400 hover:text-zinc-500 transition-colors duration-200"
          />
        </button>
      </div>

      <div className="h-[36px] aspect-square rounded-[12px] bg-zinc-50/80 flex items-center justify-center gap-2 backdrop-blur-xs">
        <button
          title="Delete"
          onClick={() => removeBlock(index)}
          className="h-[32px] aspect-square flex items-center justify-center"
        >
          <XIcon
            size={24}
            className="text-rose-400 hover:text-rose-500 transition-colors duration-200"
          />
        </button>
      </div>
    </div>
  );
};
