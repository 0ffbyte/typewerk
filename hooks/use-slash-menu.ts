import { useCallback, useEffect, useMemo, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { LucideIcon, TextIcon } from "lucide-react";

type SlashMenuState = {
  x: number;
  y: number;
  triggerIndex: number;
  command: string;
  selectedCommandIndex: number;
};

type CommandItem = {
  name: string;
  icon: LucideIcon;
  action: () => void;
};

type CommandList = CommandItem[];

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

const useSlashMenu = (ref: React.RefObject<HTMLDivElement | null>) => {
  const [state, setState] = useState<SlashMenuState | null>(null);
  const selectedIndex = useEditorStore((s) => s.selectedIndex);
  const addBlock = useEditorStore((s) => s.addBlock);

  const commandList: CommandList = useMemo(
    () =>
      [
        {
          name: "text",
          icon: TextIcon,
          action: () => addBlock("text", selectedIndex + 1),
        },
        {
          name: "image",
          icon: TextIcon,
          action: () => addBlock("image", selectedIndex + 1),
        },
        {
          name: "section",
          icon: TextIcon,
          action: () => addBlock("section", selectedIndex + 1),
        },
      ].filter((cmd) => {
        if (!state) return true;
        // Show all options when no command or empty command, filter as typing occurs
        if (!state.command || state.command.trim() === "") return true;
        return cmd.name.toLowerCase().includes(state.command.toLowerCase());
      }),
    [selectedIndex, state]
  );

  const closeMenu = useCallback(() => {
    setState(null);
    document.body.style.overflow = "auto";
  }, []);

  const handleInput = useCallback(() => {
    if (!state) return;

    const text = ref.current?.textContent;
    if (text == null) return;

    const index = state.triggerIndex + state.command.length;
    const afterText = text[index].trim();

    if (!afterText && state.command.length === 0) {
      closeMenu();
      return;
    }

    setState((s) => ({
      ...s!,
      command: afterText ? s!.command + afterText : s!.command.slice(0, -1),
      selectedCommandIndex: 0,
    }));

    console.log(state);
  }, [state]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "/") {
        const selection = document.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        // wrapped inside requestAnimationFrame to account for reflow
        requestAnimationFrame(() => {
          const range = selection.getRangeAt(0);
          const container = ref.current;
          if (!container) return;

          let rect = range.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          if (
            ref.current?.textContent.length === 0 ||
            rect.width === 0 ||
            rect.height === 0
          ) {
            const tempSpan = document.createElement("span");
            tempSpan.textContent = "\u200B";
            range.insertNode(tempSpan);
            rect = tempSpan.getBoundingClientRect();
            tempSpan.remove();

            selection.removeAllRanges();
            selection.addRange(range);
          }

          // calculate position with collision detection
          const menuWidth = 164;
          const menuHeight = 200;
          let x = rect.right - containerRect.left; // defaults
          let y = rect.top - containerRect.top + 24; // defaults

          if (x + menuWidth + 24 > window.innerWidth) x = x - menuWidth;
          if (rect.top + menuHeight + 100 > window.innerHeight)
            y = rect.top - containerRect.top - menuHeight - 12;

          // find absolute caret position within a node
          const absoluteIndex = getAbsoluteIndex(container, range);

          setState({
            command: "",
            x,
            y,
            triggerIndex: absoluteIndex, // Use absolute position
            selectedCommandIndex: 0,
          });

          // prevent scrolling
          document.body.style.overflow = "hidden";
        });
      } else if (e.key === " " || e.key === "Escape") {
        closeMenu();
      } else if (e.key === "Enter") {
        if (!state) return;
        e.preventDefault();
        const action = commandList[state.selectedCommandIndex]?.action;
        if (!action) {
          closeMenu();
          return;
        }

        action();
        if (ref.current && typeof ref.current.innerText === "string") {
          ref.current.innerText = ref.current.innerText.slice(
            0,
            -state.command.length - 1 // remove slash and command from typed input
          );
        }

        closeMenu();
        document.body.style.overflow = "auto";
      } else if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        state !== null
      ) {
        e.preventDefault();

        setState((s) => ({
          ...s!,
          selectedCommandIndex:
            Math.abs(s!.selectedCommandIndex + (e.key === "ArrowUp" ? -1 : 1)) %
            commandList.length,
        }));
      }
    },
    [state]
  );

  const handleBlur = useCallback(() => {
    closeMenu();
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("input", handleInput);
    element.addEventListener("keydown", handleKeyDown);
    element.addEventListener("blur", handleBlur);

    return () => {
      element.removeEventListener("input", handleInput);
      element.removeEventListener("keydown", handleKeyDown);
      element.removeEventListener("blur", handleBlur);
    };
  }, [handleInput, handleKeyDown]); // Event listeners & handlers

  return {
    slashMenu: state,
    setSlashMenu: setState,
    commandList,
    closeMenu,
  };
};

export default useSlashMenu;
