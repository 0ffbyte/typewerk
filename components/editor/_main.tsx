"use client";
import Header from "@/components/editor/header";
import { BlockRegistry } from "@/lib/block-registry";
import BlockControls from "@/components/editor/wrapper";
import { SiteObject, useEditorStore } from "@/store/editor-store";
import { useEffect, useState } from "react";

export default function Editor({ initialState }: { initialState: SiteObject }) {
  const state = useEditorStore((state) => state);
  const initialize = useEditorStore((state) => state.initialize);
  const addBlock = useEditorStore((state) => state.addBlock);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize store with initialState
  useEffect(() => {
    initialize(initialState);
    setIsInitialized(true);
  }, [initialState, initialize]);

  useEffect(() => {
    if (state.data.blocks.length === 0) addBlock("text", 0);
  }, [state.data.blocks, addBlock]);

  return (
    <div
      className="flex flex-col items-start justify-start gap-[24px] h-full flex-1"
      style={{
        backgroundColor: !isInitialized
          ? "var(--color-rose-200)"
          : "transparent",
      }}
    >
      {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
      <Header state={state} />

      {state.data.blocks.map((block, index) => {
        const definition = BlockRegistry[block.type];
        if (!definition) return null;

        const Block = definition.component;

        return (
          <div key={block.uuid} className="w-full">
            {index >= 1 && block.type === "section" && (
              <div className="h-[68px] w-[24px] border-t border-zinc-600" />
            )}

            <BlockControls index={index}>
              <Block {...block.props} index={index} />
            </BlockControls>
          </div>
        );
      })}

      {state.data.blocks[state.data.blocks.length - 1]?.type !== "text" && (
        <div
          id="foreword"
          className="w-full min-h-[92px] h-full flex flex-1 cursor-text"
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
