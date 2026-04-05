import { useEffect } from "react";
import { getAttributeFromNode } from "@/lib/utils";
import { useSelectionStore } from "@/store/selection-store";

export default function useEditorSelection() {
  const setSelection = useSelectionStore((s) => s.setSelection);

  // setup global selection listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const SELECTION = document.getSelection();

      if (!SELECTION || SELECTION.isCollapsed) {
        console.log("selection is null");
        setSelection(null, false, [], 0, 0);
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

      console.log("tail index:", tailIndex, "anchor index:", anchorIndex);

      const allContentEditors = document.querySelectorAll(
        "[data-class='editor-contenteditable']"
      );

      const spannedContentEditors = Array.from(allContentEditors).filter((el) =>
        SELECTION.containsNode(el, true)
      ) as HTMLDivElement[];

      const isMultiSelection = spannedContentEditors.length > 1;

      const activeEditorIds = spannedContentEditors.map((el: Element) =>
        el.getAttribute("data-editor-id")
      ) as string[];

      setSelection(
        SELECTION,
        isMultiSelection,
        activeEditorIds,
        anchorIndex,
        tailIndex
      );
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);
}
