import { useEditorStore } from "@/store/editor-store";

const useBlockType = (blockId: string) => {
  const blockType = useEditorStore((state) => {
    const block = state.data.pages[state.pageIndex].blocks.find(
      (block) => block.id === blockId
    );
    return block?.type ?? "text";
  });

  return { blockType };
};

export default useBlockType;
