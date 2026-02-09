import { useEffect } from "react";
import { useEditorStore } from "@/store/editor-store";

const useFocused = (ref: any, index: number) => {
  const selectedIndex = useEditorStore((state) => state.selectedIndex);

  useEffect(() => {
    if (selectedIndex === index) {
      ref.current?.focus();

      if (ref.current?.contentEditable === "true") {
        // Move caret to the end of contentEditable
        const el = ref.current as HTMLDivElement;
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);

        const sel = document.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [selectedIndex]);

  return { isFocused: selectedIndex === index };
};

export default useFocused;
