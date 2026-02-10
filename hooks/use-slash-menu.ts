import { useCallback, useEffect, useMemo, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import {
  AlertCircleIcon,
  ChessKnightIcon,
  Heading1Icon,
  ImageIcon,
  LucideIcon,
  QuoteIcon,
  TextIcon,
} from "lucide-react";

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
  const setEditorState = useEditorStore((s) => s.setState);

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
          icon: ImageIcon,
          action: () => addBlock("image", selectedIndex + 1),
        },
        {
          name: "section",
          icon: Heading1Icon,
          action: () => addBlock("section", selectedIndex + 1),
        },
        {
          name: "blockquote",
          icon: QuoteIcon,
          action: () => addBlock("blockquote", selectedIndex + 1),
        },
        {
          name: "alert",
          icon: AlertCircleIcon,
          action: () => addBlock("alertum", selectedIndex + 1),
        },
        {
          name: "checkmate",
          icon: ChessKnightIcon,
          action: () => addBlock("checkmate", selectedIndex + 1),
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

    if (command.length === 0) {
      closeMenu();
      return;
    }

    setState((s) => ({
      ...s!,
      command,
      selectedCommandIndex: 0,
    }));
  }, [state]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "/") {
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
          tempSpan.textContent = "/";
          tempSpan.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
          tempSpan.style.borderRadius = "4px";
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

          const menuWidth = 164;
          const menuHeight = 178;
          const MARGIN = 8;
          let x = rect.right - containerRect.left; // defaults
          let y = rect.bottom - containerRect.top + MARGIN; // defaults

          if (x + menuWidth + MARGIN * 6 > window.innerWidth) x = x - menuWidth;
          if (rect.top + menuHeight + 100 > window.innerHeight)
            y = rect.top - containerRect.top - menuHeight - 12;

          setState({
            command: "",
            x,
            y,
            triggerIndex: absoluteIndex, // Use absolute position
            selectedCommandIndex: 0,
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

        const text = slashCommand.textContent;
        const replacementNode = document.createTextNode(text);
        slashCommand.replaceWith(replacementNode);

        const selection = ref.current?.ownerDocument.getSelection();
        const range = selection?.getRangeAt(0);
        if (!selection || !range) return;

        range.setStartAfter(replacementNode);

        selection.removeAllRanges();
        selection.addRange(range);

        closeMenu();
      } else if (e.key === "Enter") {
        if (!state) return;

        const action = commandList[state.selectedCommandIndex]?.action;
        if (!action) {
          closeMenu();
          return;
        }

        e.preventDefault();
        action();
        closeMenu();
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

  const handleClick = useCallback(() => {
    state && closeMenu();
  }, []);

  const handleBlur = useCallback(() => {
    closeMenu();
    document.body.style.overflow = "auto";
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
    slashMenu: state,
    setSlashMenu: setState,
    commandList,
    closeMenu,
  };
};

export default useSlashMenu;
