import { useEffect } from "react";
import { getAttributeFromNode } from "@/lib/utils";
import { useSelectionStore } from "@/store/selection-store";

export default function useSelectionTracking() {
  const setSelection = useSelectionStore((s) => s.setSelection);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  // setup global selection listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const SELECTION = document.getSelection();

      requestAnimationFrame(() => {
        if (!SELECTION || SELECTION.isCollapsed || SELECTION.rangeCount === 0) {
          clearSelection();
          return;
        }

        const allContentEditors = document.querySelectorAll(
          "[data-class='editor-contenteditable']"
        );

        const spannedContentEditors = Array.from(allContentEditors).filter(
          (el) => SELECTION.containsNode(el, true)
        ) as HTMLDivElement[];

        const isMultiSelection = spannedContentEditors.length > 1;
        const activeEditorIds = spannedContentEditors.map((el: Element) =>
          el.getAttribute("id")
        ) as string[];

        const activeBlockIndexes = spannedContentEditors.map((el: Element) =>
          Number(el.getAttribute("data-block-index"))
        );

        const anchorIndex = activeBlockIndexes[0] ?? 0;
        const tailIndex =
          activeBlockIndexes.length > 0
            ? activeBlockIndexes[activeBlockIndexes.length - 1]
            : 0;

        // calc position using selection bounding rect
        let x: number = 0;
        let y: number = 0;
        const range = SELECTION.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        // Center x over the selection, position y above the selection
        x = rect.left + rect.width / 2;
        y = rect.top + window.scrollY;

        setSelection((s) => {
          s.selection = SELECTION;
          s.meta.isMultiSelection = isMultiSelection;
          s.meta.isSelecting = false;
          s.meta.activeEditorIds = activeEditorIds;
          s.meta.anchorIndex =
            SELECTION.direction === "backward" ? tailIndex : anchorIndex;
          s.meta.tailIndex =
            SELECTION.direction === "backward" ? anchorIndex : tailIndex;

          s.position.x = x;
          s.position.y = y;
        });
      });
    };

    const handleSelectionStart = () => {
      setSelection((s) => {
        s.meta.isSelecting = true;
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const SELECTION = document.getSelection();
        if (SELECTION && SELECTION.rangeCount > 0) {
          SELECTION.removeAllRanges();
          clearSelection();
        }
      }
    };

    document.addEventListener("selectstart", handleSelectionStart);
    document.addEventListener("pointerup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("selectstart", handleSelectionStart);
      document.removeEventListener("pointerup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}
