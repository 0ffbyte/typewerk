import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";

import { useEffect, useRef, useState } from "react";

export default function Header() {
  const state = useEditorStore((state) => state);
  const setState = useEditorStore((state) => state.setState);
  const addBlock = useEditorStore((state) => state.addBlock);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);
  const preventNewLine = useEditorStore((state) => state.preventNewLine);

  const [isImageLoading, setIsImageLoading] = useState(false);

  const pageIndex = useEditorStore((state) => state.pageIndex);

  const headingRef = useRef<HTMLTextAreaElement>(null);
  const subRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDownHeading = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      subRef.current?.focus();
    }
  };

  const handleKeyDownSubheading = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (
          state.data.pages[pageIndex].blocks.length === 0 ||
          state.data.pages[pageIndex].blocks[0].type !== "text"
        )
          addBlock("text", 0);
        else setSelectedIndex(0);
        break;

      case "ArrowUp":
        e.preventDefault();
        headingRef.current?.focus();
        break;

      case "ArrowDown":
        if (
          state.data.pages[pageIndex].blocks.length === 0 ||
          state.data.pages[pageIndex].blocks[0].type !== "text"
        )
          addBlock("text", 0);
        else setSelectedIndex(0);
        break;

      case "Backspace":
        if (state.data.header.subheading.length === 0) {
          e.preventDefault();

          if (!headingRef.current) return;
          headingRef.current.focus();
          const value = headingRef.current.value;
          headingRef.current.setSelectionRange(value.length, value.length);
        }
        break;
      case "ArrowDown":
        if (e.ctrlKey) {
          setSelectedIndex(0);
        }
        break;
      default:
        break;
    }
  };

  const handleUpdateUrl = () => {
    const newUrl = window.prompt("Enter image URL:", "");
    if (newUrl !== null && newUrl.trim() !== "") {
      setIsImageLoading(true);
      const img = new window.Image();
      img.onload = () => {
        setState((s) => {
          s.data.header.image = newUrl.trim();
        });
        setIsImageLoading(false);
      };
      img.onerror = () => {
        window.alert("Failed to load image. Please check the URL.");
      };
      img.src = newUrl.trim();
    }
  };

  useEffect(() => {
    if (selectedIndex === -1) {
      subRef.current?.focus();
      // For textarea: move cursor to end and trigger auto-resize
      if (subRef.current) {
        const textarea = subRef.current;
        const value = textarea.value;
        textarea.setSelectionRange(value.length, value.length);
      }
    }
  }, [selectedIndex]);

  return (
    <div className="flex flex-col mb-[92px] gap-[16px] w-full">
      <div
        className={cn(
          "flex flex-col gap-4 transition-all duration-75",
          preventNewLine && "blur-xs opacity-80"
        )}
      >
        <img
          title="update image"
          src={
            state.data.header.image ||
            "https://i.pinimg.com/736x/09/eb/c2/09ebc21f1af4b96e9f50619207646c71.jpg"
          }
          alt="header image"
          className="w-[64px] h-[64px] rounded-lg object-cover border hover:cursor-pointer hover:opacity-80 hidden"
          onClick={handleUpdateUrl}
        />

        <div className="flex flex-col gap-0 rounded-lg">
          <textarea
            ref={headingRef}
            className="font-sans font-medium text-[20px] leading-[28px] w-full outline-none placeholder:text-muted-foreground/50 resize-none overflow-hidden"
            placeholder="Heading"
            spellCheck={false}
            value={state.data.header.heading}
            onFocus={() => setSelectedIndex(-1)}
            onKeyDown={handleKeyDownHeading}
            onChange={(e) => {
              setState((s) => {
                s.data.header.heading = e.target.value;
              });
              // Auto-resize logic
              const ta = e.target as HTMLTextAreaElement;
              ta.style.height = "auto";
              ta.style.height = ta.scrollHeight + "px";
            }}
            style={{
              height: "auto",
            }}
            rows={1}
            maxLength={64}
          />
          <textarea
            ref={subRef}
            className="font-sans font-medium text-[20px] leading-[28px] w-full outline-none placeholder:text-muted-foreground/50 text-muted-foreground resize-none overflow-hidden"
            placeholder="Subheading"
            spellCheck
            value={state.data.header.subheading}
            onKeyDown={handleKeyDownSubheading}
            onChange={(e) => {
              setState((s) => {
                s.data.header.subheading = e.target.value;
              });
              // Auto-resize logic
              const ta = e.target as HTMLTextAreaElement;
              ta.style.height = "auto";
              ta.style.height = ta.scrollHeight + "px";
            }}
            style={{
              height: "auto",
            }}
            rows={1}
            maxLength={64}
          />
        </div>
      </div>
    </div>
  );
}
