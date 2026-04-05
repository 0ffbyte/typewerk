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

        // gets the focus node/block in the selection (tail index)
        const anchorEl = SELECTION.anchorNode;
        const lastEl = SELECTION.focusNode;

        const tailIndex = Number(
          getAttributeFromNode(lastEl, "data-block-index")
        );
        const anchorIndex = Number(
          getAttributeFromNode(anchorEl, "data-block-index")
        );

        const allContentEditors = document.querySelectorAll(
          "[data-class='editor-contenteditable']"
        );

        const spannedContentEditors = Array.from(allContentEditors).filter(
          (el) => SELECTION.containsNode(el, true)
        ) as HTMLDivElement[];

        const isMultiSelection = spannedContentEditors.length > 1;
        const activeEditorIds = spannedContentEditors.map((el: Element) =>
          el.getAttribute("data-editor-id")
        ) as string[];

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
          s.meta.anchorIndex = anchorIndex;
          s.meta.tailIndex = tailIndex;

          s.position.x = x;
          s.position.y = y;
        });
      });
    };

    const handlePointerUp = () => {
      setSelection((s) => {
        s.meta.isSelecting = true;
      });
    };

    document.addEventListener("pointerup", handleSelectionChange);
    document.addEventListener("keyup", handleSelectionChange);
    document.addEventListener("selectstart", handlePointerUp);

    return () => {
      document.removeEventListener("pointerup", handleSelectionChange);
      document.removeEventListener("keyup", handleSelectionChange);
      document.removeEventListener("selectstart", handlePointerUp);
    };
  }, []);
}
