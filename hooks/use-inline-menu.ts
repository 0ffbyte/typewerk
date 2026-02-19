import { useCallback, useEffect, useState } from "react";
import { useEditorStore } from "@/store/editor-store";

type MenuState = {
  x: number;
  y: number;
  command: string;
  triggerIndex: number;
};

const getAbsoluteIndex = (container: HTMLElement, range: Range) => {
  let absoluteIndex = 0;
  // Walk through all text nodes before the cursor to get absolute position
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === range.startContainer) {
      absoluteIndex += range.startOffset;
      break;
    }
    absoluteIndex += currentNode.textContent?.length || 0;
  }

  return absoluteIndex;
};

const useInlineMenu = (
  ref: React.RefObject<HTMLDivElement | null>,
  triggerToken: string,
  menuDimensions: { width: number; height: number }
) => {
  const [state, setState] = useState<MenuState | null>(null);
  const setEditorState = useEditorStore((s) => s.setState);

  const closeMenu = useCallback(() => {
    setState(null);
    setEditorState((s) => (s.preventNewLine = false));

    // delete slash commander (chip/span)
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const targetNode = document.getElementById("slash-commander");

    targetNode?.remove();
    range.collapse(true);

    // reactivate scrolling
    document.body.style.overflow = "auto";
  }, [setState, setEditorState]);

  const handleInput = useCallback(() => {
    if (!state || !ref.current) return;

    // Always recompute slash position from live DOM
    const textContent =
      document.getElementById("slash-commander")?.textContent ?? "";
    const command = textContent.slice(1) ?? "";

    console.log("cmd:", command, "t_idx", state.triggerIndex);

    if (textContent.length === 0) {
      closeMenu();
      return;
    }

    setState((s) => ({
      ...s!,
      command,
    }));
  }, [state]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === triggerToken) {
        // close if already open and slash pressed
        if (state) {
          closeMenu();
          return;
        }

        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const container = ref.current;
        if (!container) return;

        const text = container.textContent ?? "";
        const absoluteIndex = getAbsoluteIndex(container, range);

        if (text.length !== 0 && text.charAt(absoluteIndex - 1) !== " ") return;
        e.preventDefault();

        // wrapped inside requestAnimationFrame to account for reflow
        requestAnimationFrame(() => {
          // create a psudo element
          const tempSpan = document.createElement("span");
          tempSpan.textContent = triggerToken;
          tempSpan.style.backgroundColor = "var(--color-blue-100)";
          tempSpan.style.borderRadius = "4px";
          tempSpan.style.color = "var(--color-blue-500)";
          tempSpan.id = "slash-commander";
          range.insertNode(tempSpan);

          range.setStartAfter(tempSpan.firstChild!);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);

          // Emit an empty event (trigger an input event with empty value for handlers)
          const inputEvent = new Event("input", { bubbles: true });
          container.dispatchEvent(inputEvent);

          // calculate position with collision detection
          let rect = tempSpan.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const menuWidth = menuDimensions.width;
          const menuHeight = menuDimensions.height;
          const MARGIN = 8;
          let x = rect.right - containerRect.left; // defaults
          let y = rect.bottom - containerRect.top + MARGIN; // defaults

          if (x + menuWidth > window.innerWidth) x = x - menuWidth;
          /*if (rect.top + menuHeight + 100 > window.innerHeight)
            y = rect.top - containerRect.top - menuHeight - 12;*/

          setState({
            command: "",
            x,
            y,
            triggerIndex: absoluteIndex, // Use absolute position
          });
          setEditorState((s) => (s.preventNewLine = true));

          // prevent scrolling
          document.body.style.overflow = "hidden";
        });
      } else if (e.key === "Escape" || e.key === "ArrowLeft") {
        if (!state) return;
        closeMenu();
      } else if (e.key === " ") {
        if (!state) return;
        e.preventDefault();
        const slashCommand = document.getElementById("slash-commander");
        if (!slashCommand) return;

        // extract the text from the command span
        const text = slashCommand.textContent;
        const replacementNode = document.createTextNode(text);

        // replace command span with a text node
        slashCommand.replaceWith(replacementNode);

        const selection = ref.current?.ownerDocument.getSelection();
        const range = selection?.getRangeAt(0);
        if (!selection || !range) return;

        range.setStartAfter(replacementNode);

        selection.removeAllRanges();
        selection.addRange(range);

        closeMenu();
      } else if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        state !== null
      )
        e.preventDefault();
    },
    [state]
  );

  const handleClick = useCallback(() => {
    state && closeMenu();
  }, []);

  const handleBlur = useCallback(() => {
    closeMenu();
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("input", handleInput);
    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("click", handleClick);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("input", handleInput);
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("click", handleClick);
      element.removeEventListener("blur", handleBlur);
    };
  }, [handleInput, handleKeyDown]); // Event listeners & handlers

  return {
    menu: state,
    closeMenu,
  };
};

export default useInlineMenu;
