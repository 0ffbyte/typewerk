"use client";

import { useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focused";
import type { BlockProps } from "@/app/types";
import {
  CropIcon,
  UploadIcon,
  TrashIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { useIsMobile } from "@/hooks/use-mobile";

import Cropper, { type Area } from "react-easy-crop";

// define block props
export type ImageProps = {
  url: string;
  transform: ImageTransform;
};

type ImageTransform = {
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_TRANSFORM: ImageTransform = { x: 0, y: 0, zoom: 1 };

// define block component
const ImageBlock = ({
  url,
  transform = DEFAULT_TRANSFORM,
  index,
}: ImageProps & BlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const { isFocused } = useFocused(ref, index);
  const isMobile = useIsMobile();
  const isToolbarVisible = isMobile ? isFocused : isMouseOver;

  const [isCropping, setIsCropping] = useState(false);

  return (
    <div
      ref={ref}
      tabIndex={index}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="w-full aspect-video border relative outline-none rounded-lg group"
      style={{
        overflow: isCropping ? "visible" : "clip",
      }}
    >
      {isCropping ? (
        <CropView index={index} url={url} transform={transform} />
      ) : (
        <img
          draggable={false}
          className="w-full pointer-events-none select-none absolute top-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
            objectFit: "cover",
            transformOrigin: "center",
          }}
          src={url ?? ""}
        />
      )}
      {isToolbarVisible && (
        <Toolbar
          index={index}
          isCropping={isCropping}
          setIsCropping={setIsCropping}
        />
      )}

      {false && <Caption caption={"By Edward Snowden"} />}
    </div>
  );
};

const CropView = ({
  url,
  transform,
  index,
}: {
  url: string;
  transform: ImageTransform;
  index: number;
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const setState = useEditorStore((state) => state.setState);

  const onCropComplete = (croppedArea: Area) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block && block.type === "image") {
        block.props.transform.x = crop.x;
        block.props.transform.y = crop.y;
        block.props.transform.zoom = zoom;
      }
    });
  };
  return (
    <Cropper
      image={url}
      crop={crop}
      zoom={zoom}
      aspect={16 / 9}
      cropShape="rect"
      objectFit="cover"
      zoomSpeed={0.5}
      style={{
        mediaStyle: {
          width: "100% !important",
          height: "100% !important",
          objectFit: "cover",
        },
        cropAreaStyle: {
          borderRadius: "12px",
          border: "1px solid var(--color-blue-500)",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        },
        containerStyle: {
          width: "100%",
          height: "100%",
          overflow: "visible",
        },
      }}
      onCropChange={setCrop}
      onCropComplete={onCropComplete}
      onZoomChange={setZoom}
    />
  );
};

const Caption = ({ caption }: { caption: string }) => {
  return (
    <div className="absolute bottom-1 left-1 bg-zinc-900/80 text-muted-foreground text-sm px-2 h-[32px] rounded-md flex items-center justify-center">
      {caption}
    </div>
  );
};

type ToolbarProps = {
  index: number;
  isCropping: boolean;
  setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
};

const Toolbar = ({ index, isCropping, setIsCropping }: ToolbarProps) => {
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
      <div className="h-[32px] aspect-square rounded-md bg-zinc-900/80 flex items-center justify-center backdrop-blur-xs">
        {isCropping ? (
          <button
            title="Upload"
            onClick={() => setIsCropping(false)}
            className="h-full aspect-square flex items-center justify-center"
          >
            <CheckIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
          </button>
        ) : (
          <>
            {" "}
            <button
              title="Upload"
              onClick={() => handleUpdateUrl()}
              className="h-full aspect-square flex items-center justify-center"
            >
              <UploadIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
            <button
              title="Crop"
              className="h-full aspect-square flex items-center justify-center"
              onClick={() => {
                setIsCropping(true);
              }}
            >
              <CropIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
            <button
              title="Delete"
              onClick={() => removeBlock(index)}
              className="h-full aspect-square flex items-center justify-center"
            >
              <TrashIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageBlock;
