"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import useFocused from "@/hooks/editor/use-focus";
import type { BlockProps } from "@/app/types";
import {
  CropIcon,
  UploadIcon,
  TrashIcon,
  CheckIcon,
  ResetIcon,
  EnterFullScreenIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
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
import { ChevronLeft, ChevronRight } from "lucide-react";

type ImageTransform = {
  x: number;
  y: number;
  zoom: number;
};

type Image = {
  url: string;
  transform: ImageTransform;
};

export type ImageProps = { images: Image[] };

const DEFAULT_TRANSFORM: ImageTransform = { x: 0, y: 0, zoom: 1 };

// define block component
const ImageBlock = ({ images, index }: ImageProps & BlockProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const setState = useEditorStore((state) => state.setState);

  const { isFocused } = useFocused(ref, index);
  const isMobile = useIsMobile();
  const isToolbarVisible = isMobile ? isFocused : isMouseOver;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [pendingTransform, setPendingTransform] = useState<ImageTransform>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  const safeImages = images?.length ? images : [];
  const current = safeImages[activeSlide];

  // ── navigation ──
  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(safeImages.length - 1, i));
    setActiveSlide(clamped);
    // sync pending crop state to the new slide
    const img = safeImages[clamped];
    setPendingTransform({
      x: img?.transform.x ?? 0,
      y: img?.transform.y ?? 0,
      zoom: img?.transform.zoom ?? 1,
    });
    // native scroll
    trackRef.current?.children[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleAddImage = () => {
    const url = window.prompt("Enter image URL:", "");
    if (!url?.trim()) return;
    const img = new window.Image();
    img.onload = () => {
      setState((s) => {
        const block = s.data.pages[s.pageIndex].blocks[index];
        if (block?.type === "image") {
          const props = block.props as ImageProps;
          props.images.push({
            url: url.trim(),
            transform: { ...DEFAULT_TRANSFORM },
          });
        }
      });
      console.log("images:", safeImages.length);
      setActiveSlide(safeImages.length); // will be length after push
    };
    img.onerror = () => window.alert("Failed to load image. Check the URL.");
    img.src = url.trim();
  };

  // calculate dynamic transform
  const baseW = 670;
  const multiplier = useMemo(() => {
    const currentH = ref.current?.clientWidth!;
    return Number((currentH / baseW).toFixed(2));
  }, [ref.current?.clientWidth]);

  return (
    <div
      ref={ref}
      tabIndex={index}
      onMouseOver={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
      className="w-full h-full aspect-video border bg-card relative outline-none rounded-lg group select-none"
      style={{
        overflow: isCropping ? "visible" : "clip",
      }}
    >
      {/* ── sheen layer ── */}
      <div
        aria-hidden
        className="absolute inset-0 left-0 top-0 w-full h-full inset-shadow-sheen rounded-lg z-10 pointer-events-none"
      />

      {/* ── scroll track ── */}
      <div
        ref={trackRef}
        className="flex w-full h-full overflow-x-hidden snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
        onScroll={(e) => {
          // keep activeSlide in sync when user physically scrolls (touch)
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / el.clientWidth);
          if (idx !== activeSlide) setActiveSlide(idx);
        }}
      >
        {safeImages.length === 0 && (
          <div className="flex-none w-full h-full flex items-center justify-center text-zinc-500 text-sm">
            No images — tap{" "}
            <span className="mx-2">
              <UploadIcon />
            </span>{" "}
            to upload one
          </div>
        )}

        {safeImages.map((img, i) => (
          <div key={i} className="flex-none w-full h-full snap-center">
            {i === activeSlide && isCropping ? (
              <CropView
                url={img.url}
                containerRef={ref}
                pendingTransform={pendingTransform}
                setPendingTransform={setPendingTransform}
                transform={img.transform}
              />
            ) : (
              <div className="border-blue-500 flex items-center justify-center overflow-clip aspect-video w-full h-full relative">
                {true && (
                  <img
                    draggable={false}
                    className="opacity-100 w-full pointer-events-none select-none overflow-clip absolute top-1/2 -left-1/2 translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate(${
                        img.transform.x * multiplier
                      }px, ${img.transform.y * multiplier}px) scale(${
                        img.transform.zoom
                      })`,
                      transformOrigin: "center",
                      objectFit: "cover",
                    }}
                    src={img.url}
                  />
                )}

                <p className="text-xs font-sans text-muted-foreground"></p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── dots ── */}
      {safeImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 items-center">
          {safeImages.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i === activeSlide
                  ? "w-4 bg-zinc-900/50"
                  : "w-2 bg-zinc-900/50 hover:bg-zinc-900/50"
              )}
            />
          ))}
        </div>
      )}

      {/* ── nav arrows ── */}
      {safeImages.length > 1 && isToolbarVisible && !isCropping && (
        <>
          <div
            onClick={() => goTo(activeSlide + 1)}
            className="w-[30%] h-full absolute right-0 top-0 bg-red-500/0 flex items-center justify-end px-2 bg-linear-to-l from-black/0 to-transparent transition-colors duration-300 hover:from-black/10 hover:to-transparent"
          >
            <button
              disabled={activeSlide === safeImages.length - 1}
              className="hidden"
            >
              <ChevronRight />
            </button>
          </div>
          <div
            onClick={() => goTo(activeSlide - 1)}
            className="w-[30%] h-full absolute left-0 top-0 flex items-center justify-start px-2 bg-linear-to-r from-black/0 to-transparent transition-colors duration-300 hover:from-black/10 hover:to-transparent"
          >
            <button
              disabled={activeSlide === 0}
              className="disabled:opacity-50"
            >
              <ChevronLeft className="hidden" />
            </button>
          </div>
        </>
      )}

      {/* ── add button ── */}
      {isToolbarVisible && !isCropping && safeImages.length >= 1 && (
        <button
          title="Add image"
          onClick={handleAddImage}
          className="absolute top-2 left-2 z-20 h-8 px-2.5 rounded-md bg-zinc-900/70 border border-white/10 backdrop-blur-sm flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-xs transition-colors"
        >
          <PlusIcon />
          Add
        </button>
      )}

      {isToolbarVisible && (
        <Toolbar
          index={index}
          url={current?.url}
          slideIndex={activeSlide}
          containerRef={ref}
          isCropping={isCropping}
          pendingTransform={pendingTransform}
          setPendingTransform={setPendingTransform}
          setIsCropping={setIsCropping}
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
  pendingTransform,
  setPendingTransform,
}: {
  url: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  transform?: ImageTransform;
  pendingTransform: ImageTransform;
  setPendingTransform: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; zoom: number }>
  >;
}) => {
  const onCropComplete = (cropArea: Area, pxs: Area) => {
    console.log("area", cropArea, "inPx", pxs);
  };

  return (
    <Cropper
      image={url}
      crop={{
        x: pendingTransform.x,
        y: pendingTransform.y,
      }}
      zoom={pendingTransform.zoom}
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
          zIndex: 100,
        },
      }}
      onCropChange={(crop) =>
        setPendingTransform((prev) => ({ ...prev, x: crop.x, y: crop.y }))
      }
      onZoomChange={(zoom) =>
        setPendingTransform((prev) => ({ ...prev, zoom }))
      }
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
  slideIndex: number;
  url: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isCropping: boolean;
  pendingTransform: ImageTransform;
  setPendingTransform: React.Dispatch<React.SetStateAction<ImageTransform>>;
  setIsCropping: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const Toolbar = ({
  index,
  url,
  slideIndex,
  containerRef,
  isCropping,
  setIsCropping,
  pendingTransform,
  setPendingTransform,
  setIsLoading,
}: ToolbarProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);

  const handleUpdateUrl = () => {
    const newUrl = window.prompt("Enter image URL:", "");
    if (!newUrl?.trim()) return;
    const img = new window.Image();
    img.onload = () => {
      setState((s) => {
        const block = s.data.pages[s.pageIndex].blocks[index];
        if (block?.type === "image") {
          block.props.images[slideIndex] = {
            url: newUrl.trim(),
            transform: { ...DEFAULT_TRANSFORM },
          };
        }
      });
      setPendingTransform({ x: 0, y: 0, zoom: 1 });
      setIsLoading(false);
    };
    img.onerror = () => window.alert("Failed to load image. Check the URL.");
    img.src = newUrl.trim();
  };

  const handleResetCrop = () => {
    setPendingTransform({ x: 0, y: 0, zoom: 1 });
  };

  const handleCenterCrop = () => {
    setPendingTransform((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  const commitCrop = () => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block?.type === "image") {
        block.props.images[slideIndex].transform = {
          x: pendingTransform.x,
          y: pendingTransform.y,
          zoom: pendingTransform.zoom,
        };
      }
    });
    setIsCropping(false);
    setState((s) => (s.preventNewLine = false));
    document.body.style.overflow = "auto";
  };

  return (
    <div className="absolute top-1 right-1 gap-1 flex items-center justify-start">
      {isCropping ? (
        <>
          <div className="z-100 h-[32px] aspect-square rounded-md bg-zinc-900/70 border border-border/10 flex items-center justify-center backdrop-blur-xs">
            <button
              title="reset crop"
              onClick={handleResetCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <ResetIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
            </button>
            <button
              title="center crop"
              onClick={handleCenterCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <EnterFullScreenIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
            </button>
          </div>
          <div className="z-100 h-[32px] aspect-square rounded-md bg-zinc-900/70 border border-border/10 flex items-center justify-center backdrop-blur-xs">
            <button
              title="apply crop"
              onClick={commitCrop}
              className="h-full aspect-square flex items-center justify-center"
            >
              <CheckIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
            </button>
          </div>
        </>
      ) : (
        <div className="h-[32px] aspect-square rounded-md bg-zinc-900/70 border border-border/10 flex items-center justify-center backdrop-blur-xs">
          {" "}
          <button
            title="upload"
            onClick={() => handleUpdateUrl()}
            className="h-full aspect-square flex items-center justify-center"
          >
            <UploadIcon className="text-zinc-400 hover:text-zinc-300 transition-colors duration-75" />
          </button>
          <button
            disabled={!url}
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
              <div className="items-center gap-2">
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
