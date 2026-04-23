import { useEffect } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { useEditorStore } from "@/store/editor-store";
import { deleteCrossEditorSelection } from "@/lib/utils";

export default function useBackspace() {
  const setState = useEditorStore((s) => s.setState);
  const runCleanup = useEditorStore((s) => s.runCleanup);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);

  const selection = useSelectionStore((s) => s.selection);
  const isMultiSelection = useSelectionStore((s) => s.meta.isMultiSelection);
  const activeEditorIds = useSelectionStore((s) => s.meta.activeEditorIds);
  const anchorIndex = useSelectionStore((s) => s.meta.anchorIndex);
  const tailIndex = useSelectionStore((s) => s.meta.tailIndex);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      } else if (e.key === "Backspace") {
        if (isMultiSelection) {
          e.preventDefault();
          console.log("multi selection");
          deleteCrossEditorSelection(selection, activeEditorIds);
          requestAnimationFrame(() => {
            // Collapse the native browser selection
            document.getSelection()?.removeAllRanges();

            // Perform cleanup
            runCleanup();
            setState((s) => {
              s.isEditable = true;
              s.selectedIndex = isMultiSelection ? tailIndex : anchorIndex;
            });
          });
        } else {
          const selection = document.getSelection();
          if (!selection || selection.rangeCount === 0) return;

          const range = selection.getRangeAt(0);
          range.deleteContents();

          requestAnimationFrame(() => {
            // Perform cleanup
            runCleanup();
            clearSelection();
            setState((s) => {
              s.isEditable = true;
            });

            // get current editor using selected index
            document
              .querySelectorAll("[data-editor-id]")
              .forEach((el: Element) => {
                const index = el.getAttribute("data-block-index") ?? "";
                if (index === selectedIndex.toString()) {
                  // Ensure the element is focusable before calling focus()
                  if ((el as HTMLElement).tabIndex === -1) {
                    (el as HTMLElement).tabIndex = 0;
                  }
                  (el as HTMLElement).focus();
                }
              });
          });
        }
      }
    };

    // handles key down events
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeEditorIds, isMultiSelection]);
}
