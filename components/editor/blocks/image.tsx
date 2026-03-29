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
  ResetIcon,
  EnterFullScreenIcon,
} from "@radix-ui/react-icons";
import { useIsMobile } from "@/hooks/use-mobile";

import Cropper, { type Area } from "react-easy-crop";
import { BlockDefinition } from "@/lib/block-registry";

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
  const [pendingCrop, setPendingCrop] = useState({
    x: transform.x,
    y: transform.y,
  });
  const [pendingZoom, setPendingZoom] = useState(transform.zoom);

  return (
    <div
      ref={ref}
      tabIndex={index}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="w-full h-full aspect-video border bg-zinc-200 relative outline-none rounded-lg group"
      style={{
        overflow: isCropping ? "visible" : "clip",
      }}
    >
      {isCropping ? (
        <CropView
          url={url}
          containerRef={ref}
          transform={transform}
          pendingCrop={pendingCrop}
          pendingZoom={pendingZoom}
          setPendingCrop={setPendingCrop}
          setPendingZoom={setPendingZoom}
        />
      ) : (
        <img
          draggable={false}
          className="pointer-events-none select-none w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
          containerRef={ref}
          isCropping={isCropping}
          pendingCrop={pendingCrop}
          pendingZoom={pendingZoom}
          setIsCropping={setIsCropping}
          setPendingCrop={setPendingCrop}
          setPendingZoom={setPendingZoom}
        />
      )}

      {false && <Caption caption={"By Edward Snowden"} />}
    </div>
  );
};

const CropView = ({
  url,
  containerRef,
  transform,
  pendingCrop,
  pendingZoom,
  setPendingCrop,
  setPendingZoom,
}: {
  url: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  transform?: ImageTransform;
  pendingCrop: { x: number; y: number };
  pendingZoom: number;
  setPendingCrop: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  setPendingZoom: React.Dispatch<React.SetStateAction<number>>;
}) => {
  return (
    <Cropper
      image={url}
      crop={pendingCrop}
      zoom={pendingZoom}
      objectFit="cover"
      cropSize={{
        width: containerRef.current?.clientWidth ?? 720,
        height: containerRef.current?.clientHeight ?? 420,
      }}
      aspect={16 / 9}
      maxZoom={2}
      minZoom={0.2}
      cropShape="rect"
      zoomSpeed={0.4}
      style={{
        mediaStyle: {
          objectFit: "cover",
        },
        cropAreaStyle: {
          borderRadius: "12px",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        },
        containerStyle: {
          width: "100%",
          height: "100%",
          overflow: "visible",
          zIndex: 10,
        },
      }}
      onCropChange={setPendingCrop}
      onZoomChange={setPendingZoom}
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
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCropping: boolean;
  pendingCrop: { x: number; y: number };
  pendingZoom: number;
  setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingCrop: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  setPendingZoom: React.Dispatch<React.SetStateAction<number>>;
};

const Toolbar = ({
  index,
  containerRef,
  isCropping,
  pendingCrop,
  pendingZoom,
  setIsCropping,
  setPendingCrop,
  setPendingZoom,
}: ToolbarProps) => {
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

  const handleResetCrop = () => {
    setPendingCrop({ x: 0, y: 0 });
    setPendingZoom(1);
  };

  const handleCenterCrop = () => {
    setPendingCrop({ x: 0, y: 0 });
  };

  const commitCrop = () => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block && block.type === "image") {
        const props = block.props as ImageProps;
        props.transform.x = pendingCrop.x;
        props.transform.y = pendingCrop.y;
        props.transform.zoom = pendingZoom;
      }
    });

    setIsCropping(false);
    setState((s) => (s.preventNewLine = false));
    document.body.style.overflow = "auto";
  };

  return (
    <div className="absolute top-1 right-1 gap-1 flex items-center justify-start z-20">
      {isCropping ? (
        <>
          <div className="h-[32px] aspect-square rounded-md bg-zinc-900/80 border border-border/10 flex items-center justify-center backdrop-blur-xs">
            <button
              title="reset crop"
              onClick={handleResetCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <ResetIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
            <button
              title="center crop"
              onClick={handleCenterCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <EnterFullScreenIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
          </div>
          <div className="h-[32px] aspect-square rounded-md bg-zinc-900/80 border border-border/10 flex items-center justify-center backdrop-blur-xs">
            <button
              title="apply crop"
              onClick={commitCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <CheckIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
            </button>
          </div>
        </>
      ) : (
        <div className="h-[32px] aspect-square rounded-md bg-zinc-900/80 border border-border/10 flex items-center justify-center backdrop-blur-xs">
          {" "}
          <button
            title="upload"
            onClick={() => handleUpdateUrl()}
            className="h-full aspect-square flex items-center justify-center"
          >
            <UploadIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
          </button>
          <button
            title="crop"
            className="h-full aspect-square flex items-center justify-center"
            onClick={() => {
              setIsCropping(true);
              setState((s) => (s.preventNewLine = true));

              if (containerRef.current) {
                containerRef.current.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }
              document.body.style.overflow = "hidden";
            }}
          >
            <CropIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
          </button>
          <button
            title="delete"
            onClick={() => removeBlock(index)}
            className="h-full aspect-square flex items-center justify-center"
          >
            <TrashIcon className="text-zinc-200 hover:text-zinc-400 transition-colors duration-75" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
