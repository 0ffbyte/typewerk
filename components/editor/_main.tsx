"use client";
import Header from "@/components/editor/header";
import { BlockRegistry } from "@/lib/block-registry";
import BlockHandle from "@/components/editor/block-wrapper";
import { SiteObject, useEditorStore } from "@/store/editor-store";
import { useEffect, useState } from "react";
import useSync from "@/hooks/use-sync";
import Spacer from "@/components/editor/spacer";
import {
  rectIntersection,
  DndContext,
  DragEndEvent,
  pointerWithin,
  closestCorners,
  closestCenter,
} from "@dnd-kit/core";

export default function Editor({
  initialState,
  siteId,
}: {
  initialState: SiteObject;
  siteId: string;
}) {
  const state = useEditorStore((state) => state);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialize = useEditorStore((state) => state.initialize);
  const reorderBlocks = useEditorStore((state) => state.reorderBlocks);
  useSync(siteId, state.data);

  useEffect(() => {
    initialize(initialState);
    setIsInitialized(true);
  }, [initialState, initialize]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      alert("TODO: Keyboard shortcut for commands");
    }
  };

  if (!isInitialized) return <p>Initialzing editor...</p>;
  return (
    <div
      className="flex flex-col items-start justify-start h-full flex-1 w-full"
      onKeyDown={handleKeyDown}
    >
      {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}

      <Header state={state} />

      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        {state.data.blocks.map((block, index) => {
          const definition = BlockRegistry[block.type];
          if (!definition) return null;

          const Block = definition.component;

          return (
            <div key={block.uuid} className="w-full">
              <Spacer id={block.uuid} index={index} />
              {block.type === "section" && index >= 1 && (
                <div className="h-[64]" />
              )}

              <BlockHandle index={index} id={block.uuid}>
                <Block {...block.props} index={index} />
              </BlockHandle>
            </div>
          );
        })}

        <Spacer id={"end-block"} index={state.data.blocks.length} />
      </DndContext>

      {state.data.blocks[state.data.blocks.length - 1]?.type !== "text" && (
        <div
          id="foreword"
          className="w-full min-h-[92px] h-full flex flex-1 cursor-text rounded-[8px] hover:bg-zinc-200 transition-colors duration-200"
          onClick={() => {
            const insertAt = state.data.blocks.length;
            state.addBlock("text", insertAt);
            state.setSelectedIndex(insertAt);
          }}
        />
      )}
    </div>
  );
}
