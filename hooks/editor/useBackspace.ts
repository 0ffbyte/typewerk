import { useEffect } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { useEditorStore } from "@/store/editor-store";

export default function useBackspace() {
  const setState = useEditorStore((s) => s.setState);
  const runCleanup = useEditorStore((s) => s.runCleanup);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);

  const selection = useSelectionStore((s) => s.selection);
  const isMultiSelection = useSelectionStore((s) => s.meta.isMultiSelection);
  const selectedEditorIds = useSelectionStore((s) => s.meta.activeEditorIds);
  const anchorIndex = useSelectionStore((s) => s.meta.anchorIndex);
  const tailIndex = useSelectionStore((s) => s.meta.tailIndex);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      } else if (e.key === "Backspace") {
        const range = selection.getRangeAt(0);
        const SEIDS = selectedEditorIds;

        if (isMultiSelection) {
          e.preventDefault();
          document.querySelectorAll("[data-editor-id]").forEach((el) => {
            const editorId = el.getAttribute("data-editor-id") ?? "";
            if (!SEIDS.includes(editorId) || !selection.containsNode(el, true))
              return;

            // Clamp the range to only the portion inside this element
            const elRange = document.createRange();
            elRange.selectNodeContents(el);

            const start =
              range.compareBoundaryPoints(Range.START_TO_START, elRange) > 0
                ? range
                : elRange;

            const end =
              range.compareBoundaryPoints(Range.END_TO_END, elRange) < 0
                ? range
                : elRange;

            const clampedRange = document.createRange();
            clampedRange.setStart(start.startContainer, start.startOffset);
            clampedRange.setEnd(end.endContainer, end.endOffset);

            clampedRange.deleteContents();

            const inputEvent = new Event("input", { bubbles: true });
            el.dispatchEvent(inputEvent);
          });

          // Collapse the native browser selection
          document.getSelection()?.removeAllRanges();

          requestAnimationFrame(() => {
            // Perform cleanup
            runCleanup();
            clearSelection();
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
  }, [selectedEditorIds]);
}
