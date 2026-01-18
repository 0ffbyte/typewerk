"use client";
import Header from "@/components/editor/header";
import { BlockRegistry } from "@/lib/block-registry";
import BlockControls from "@/components/editor/wrapper";
import { SiteObject, useEditorStore } from "@/store/editor-store";
import { useEffect, useState } from "react";
import useSync from "@/hooks/use-sync";

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
  const addBlock = useEditorStore((state) => state.addBlock);

  // Syncs state with server
  useSync(siteId, state.data);

  // Initializes store
  useEffect(() => {
    initialize(initialState);
    setIsInitialized(true);
  }, [initialState, initialize]);

  // Adds a default text block if none exist
  useEffect(() => {
    if (state.data.blocks.length === 0) addBlock("text", 0);
  }, [state.data.blocks, addBlock]);

  if (!isInitialized) return <p>Initialzing editor...</p>;
  return (
    <div className="flex flex-col items-start justify-start gap-[24px] h-full flex-1">
      {true && (
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
              <div className="h-[68px] w-[24px] bg-rose-200" />
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
          className="w-full min-h-[92px] h-full flex flex-1 cursor-text bg-rose-200"
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

// DEBUG
/**
 *  {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
 */
