import { EditorState } from "@/store/editor-store";
import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef } from "react";

export default function HeaderBlock({ state }: { state: EditorState }) {
  const setState = useEditorStore((state) => state.setState);
  const addBlock = useEditorStore((state) => state.addBlock);
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);

  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (
        state.data.blocks.length === 0 ||
        state.data.blocks[0].type !== "text"
      ) {
        e.preventDefault();
        addBlock("text", 0);
      }
    } else if (e.ctrlKey && e.key === "ArrowDown") {
      setSelectedIndex(0);
    }
  };

  useEffect(() => {
    if (selectedIndex === -1) {
      ref.current?.focus();
      // For textarea: move cursor to end and trigger auto-resize
      if (ref.current) {
        const textarea = ref.current;
        const value = textarea.value;
        textarea.setSelectionRange(value.length, value.length);
      }
    }
  }, [selectedIndex]);

  return (
    <div className="flex flex-col mb-[68px] gap-[16px] w-full">
      <div>
        <img
          width={64}
          height={64}
          className="object-fit rounded-[20px] hidden"
          src={state.data.header.image ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1">
        <textarea
          ref={ref}
          className="text-[40px] leading-[48px] w-full font-bold outline-none placeholder:text-zinc-400 resize-none overflow-hidden "
          placeholder="New page"
          spellCheck={false}
          value={state.data.header.heading}
          onKeyDown={handleKeyDown}
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
        <input
          className="text-[40px] leading-[32px] w-[300] font-bold outline-none placeholder:text-zinc-400 text-zinc-400 hidden"
          placeholder="Subheading"
          value={state.data.header.subheading}
          onChange={(e) =>
            setState((s) => {
              s.data.header.subheading = e.target.value;
            })
          }
        />
      </div>
    </div>
  );
}
