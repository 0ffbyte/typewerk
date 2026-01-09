import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";

const useFocus = (index: number) => {
  const ref = useRef<HTMLInputElement>(null);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (selectedIndex === index && ref.current) {
      ref.current.focus();
      setIsFocused(true);
    } else {
      setIsFocused(false);
    }

    return () => {
      if (ref.current) {
        ref.current.blur();
        setIsFocused(false);
      }
    };
  }, [selectedIndex, index]);

  return { ref, selectedIndex, isFocused };
};

export default useFocus;
