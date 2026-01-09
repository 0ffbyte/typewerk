import { useEditorStore } from "@/store/editor-store";

type WrapperBlockProps = {
  children: React.ReactNode;
  index: number;
};

const BlockControls = ({ children, index }: WrapperBlockProps) => {
  const setSelectedIndex = useEditorStore((state) => state.setSelectedIndex);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const addBlock = useEditorStore((state) => state.addBlock);
  const selectedIndex = useEditorStore((state) => state.selectedIndex);
  const isSelected = selectedIndex === index;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // shortcut for adding blocks
    if (e.altKey) {
      const key = e.key.toLowerCase();
      const insertAt = selectedIndex + 1;
      switch (key) {
        case "s":
          addBlock("section", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "w":
          addBlock("text", insertAt);
          setSelectedIndex(insertAt);
          break;
        case "i":
          addBlock("image", insertAt);
          setSelectedIndex(insertAt);
          break;
        default:
          break;
      }
    } else {
      // handle block traversal
      switch (e.key) {
        case "ArrowUp":
          if (index >= 1) {
            setSelectedIndex(index - 1);
          }
          break;
        case "ArrowDown":
          // Fetch the total number of blocks from the store
          const totalBlocks = useEditorStore.getState().data.blocks.length;
          if (index < totalBlocks - 1) {
            setSelectedIndex(index + 1);
          } else if (
            useEditorStore.getState().data.blocks[index].type !== "text"
          ) {
            addBlock("text", index + 1);
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div
      draggable={false}
      aria-activedescendant={isSelected ? "" : undefined}
      tabIndex={index}
      role="list"
      onKeyDown={handleKeyDown}
      onFocus={() => setSelectedIndex(index)}
      //onBlur={() => setSelectedIndex(-1)}
      className="flex items-start justify-start relative w-full outline-none"
      style={{
        minHeight: "auto",
        fieldSizing: "content",
        borderBottom: isSelected
          ? "1px solid var(--color-zinc-600)"
          : "1px solid transparent",
      }}
    >
      {isSelected && (
        <div className="absolute top-[-16px] left-[-32px] flex items-center justify-center">
          <button onClick={() => removeBlock(index)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="var(--color-zinc-400)"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

export default BlockControls;
