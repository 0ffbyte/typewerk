"use client";

import { useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/use-focus";
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

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import Cropper, { type Area } from "react-easy-crop";

// define block props
export type ImageProps = {
  url: string;
  width: number;
  height: number;
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
  width = 100,
  height = 100,
  transform = DEFAULT_TRANSFORM,
  index,
}: ImageProps & BlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const { isFocused } = useFocused(ref, index);
  const isMobile = useIsMobile();
  const isToolbarVisible = isMobile ? isFocused : isMouseOver || isFocused;

  const [isLoading, setIsLoading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [pendingCrop, setPendingCrop] = useState({
    x: transform.x,
    y: transform.y,
  });
  const [pendingZoom, setPendingZoom] = useState(transform.zoom);

  // calculate dynamic transform
  const baseW = 720;
  const multiplier = useMemo(() => {
    const currentH = ref.current?.clientWidth!;
    return Number((currentH / baseW).toFixed(1));
  }, [ref.current?.clientWidth]);

  return (
    <div
      ref={ref}
      tabIndex={index}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="w-full h-full aspect-video border bg-zinc-200 relative outline-none rounded-lg group select-none"
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
          ref={imageRef}
          draggable={false}
          className="w-full pointer-events-none select-none absolute top-1/2 -left-1/2 translate-x-1/2 -translate-y-1/2"
          style={{
            transform: `translate(${transform.x * multiplier}px, ${
              transform.y * multiplier
            }px) scale(${transform.zoom})`,
            transformOrigin: "center",
            objectFit: "cover",
          }}
          src={url ?? ""}
        />
      )}

      {isToolbarVisible && (
        <Toolbar
          index={index}
          url={url}
          containerRef={ref}
          isCropping={isCropping}
          pendingCrop={pendingCrop}
          pendingZoom={pendingZoom}
          setIsCropping={setIsCropping}
          setPendingCrop={setPendingCrop}
          setPendingZoom={setPendingZoom}
          setIsLoading={setIsLoading}
        />
      )}

      {isLoading && (
        <div className="w-full h-full bg-zinc-100/80 backdrop-blur-md flex items-center justify-center z-30 cursor-wait">
          <p>Loading Image...</p>
        </div>
      )}

      {false && <Caption caption={`m: ${multiplier}`} />}
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
  const onCropComplete = (cropArea: Area, pxs: Area) => {
    console.log("area", cropArea, "inPx", pxs);
  };

  return (
    <Cropper
      image={url}
      crop={pendingCrop}
      zoom={pendingZoom}
      cropSize={{
        width: containerRef.current?.clientWidth ?? 0,
        height: containerRef.current?.clientHeight ?? 0,
      }}
      objectFit="cover"
      aspect={16 / 9}
      maxZoom={2}
      minZoom={0.2}
      cropShape="rect"
      zoomSpeed={0.1}
      style={{
        mediaStyle: {
          width: "100% !important",
          height: "100% !important",
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
      onCropComplete={onCropComplete}
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
  url: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCropping: boolean;
  pendingCrop: { x: number; y: number };
  pendingZoom: number;
  setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
  setPendingCrop: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  setPendingZoom: React.Dispatch<React.SetStateAction<number>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const Toolbar = ({
  index,
  url,
  containerRef,
  isCropping,
  pendingCrop,
  pendingZoom,
  setIsCropping,
  setPendingCrop,
  setPendingZoom,
  setIsLoading,
}: ToolbarProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const handleUpdateUrl = () => {
    const newUrl = window.prompt("Enter image URL:", "");
    if (newUrl !== null && newUrl.trim() !== "") {
      setIsLoading(true);
      const img = new window.Image();
      img.onload = () => {
        setState((s) => {
          const block = s.data.pages[s.pageIndex].blocks[index];
          if (block && block.type === "image") {
            block.props.url = newUrl.trim();
            block.props.width = img.width;
            block.props.height = img.height;
            block.props.transform.x = 0;
            block.props.transform.y = 0;
            block.props.transform.zoom = 1;
          }
        });
        setPendingCrop({ x: 0, y: 0 });
        setPendingZoom(1);
        setIsLoading(false);
      };
      img.onerror = () => {
        window.alert("Failed to load image. Please check the URL.");
      };
      img.src = newUrl.trim();
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
            <UploadIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
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
            <CropIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
          </button>
          <Dialog>
            <DialogTrigger asChild>
              <button
                title="delete"
                className="h-full aspect-square flex items-center justify-center"
              >
                <TrashIcon className="text-rose-400 hover:text-rose-300 transition-colors duration-75" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Image</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this image?
                </DialogDescription>
              </DialogHeader>
              <div className="items-center gap-2 hidden">
                <img
                  src={url}
                  className="w-full aspect-video object-cover rounded-md"
                />
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant={"destructive"}
                    onClick={() => removeBlock(index)}
                  >
                    Delete
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
