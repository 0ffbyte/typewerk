import { useEditorStore } from "@/store/editor-store";

import { useEffect, useRef } from "react";

export default function Header() {
  const state = useEditorStore((state) => state);
  const setState = useEditorStore((state) => state.setState);
  const addBlock = useEditorStore((state) => state.addBlock);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);

  const pageIndex = useEditorStore((state) => state.pageIndex);

  const headingRef = useRef<HTMLTextAreaElement>(null);
  const subRef = useRef<HTMLTextAreaElement>(null);

  const handleHeadingKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      subRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        state.data.pages[pageIndex].blocks.length === 0 ||
        state.data.pages[pageIndex].blocks[0].type !== "text"
      ) {
        addBlock("text", 0);
      } else {
        setSelectedIndex(0);
      }
    } else if (
      e.key === "Backspace" &&
      state.data.header.subheading.length === 0
    ) {
      e.preventDefault();

      if (!headingRef.current) return;
      headingRef.current.focus();
      const value = headingRef.current.value;
      headingRef.current.setSelectionRange(value.length, value.length);
    } else if (e.ctrlKey && e.key === "ArrowDown") {
      setSelectedIndex(0);
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
      <div className="flex flex-col gap-1">
        <textarea
          ref={headingRef}
          className="font-medium text-[32px] leading-[36px] w-full outline-none placeholder:text-zinc-300 resize-none overflow-hidden"
          placeholder="Heading"
          spellCheck={false}
          value={state.data.header.heading}
          onFocus={() => setSelectedIndex(-1)}
          onKeyDown={handleHeadingKeyDown}
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
          className="font-medium text-[32px] leading-[36px] w-full outline-none placeholder:text-zinc-300 text-muted-foreground resize-none overflow-hidden"
          placeholder="Subheading"
          spellCheck={false}
          value={state.data.header.subheading}
          onKeyDown={handleKeyDown}
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
  );
}
