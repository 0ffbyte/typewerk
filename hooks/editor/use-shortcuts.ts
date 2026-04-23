import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";

export default function useShortcuts() {
  const addBlock = useEditorStore((s) => s.addBlock);
  const setSelectedIndex = useEditorStore((s) => s.setSelectedIndex);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);

  const handleKeyDown = (e: KeyboardEvent) => {
    // shortcut for adding blocks
    if (e.altKey) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      const insertAt = selectedIndex + 1;
      switch (key) {
        case "s":
          addBlock("section", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "t":
          addBlock("text", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "i":
          addBlock("image", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "b":
          addBlock("blockquote", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "c":
          addBlock("code", insertAt);
          setSelectedIndex(insertAt);
          break;
        default:
          break;
      }
    } else if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      addBlock("text", selectedIndex + 1);
    } else if (e.ctrlKey) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(selectedIndex - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(selectedIndex + 1);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);
}
