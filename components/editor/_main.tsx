"use client";

import Header from "@/components/editor/header";
import { BlockRegistry } from "@/lib/block-registry";
import BlockHandle from "@/components/editor/block-wrapper";
import { useEditorStore } from "@/store/editor-store";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSync from "@/hooks/use-sync";
import Spacer from "@/components/editor/spacer";
import { rectIntersection, DndContext, DragEndEvent } from "@dnd-kit/core";
import { SiteObject } from "@/app/types";

export default function Editor({
  initialState,
  siteId,
}: {
  initialState: SiteObject;
  siteId: string;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const state = useEditorStore();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pageName = searchParams.get("p") || "home";
    const foundIndex = state.data.pages.findIndex((p) => p.name === pageName);
    state.setPageIndex(foundIndex !== -1 ? foundIndex : 0);
  }, [searchParams, state.data.pages]);

  const pageData = useMemo(() => {
    return state.data.pages[state.pageIndex];
  }, [state.pageIndex, state.data.pages]);

  useEffect(() => {
    state.initialize(initialState);
    setIsInitialized(true);
  }, [initialState, state.initialize]);

  useSync(siteId, state.data, isInitialized);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      state.reorderBlocks(active.id as string, over.id as string);
    }
  };

  if (!isInitialized)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Initialzing editor...
      </div>
    );
  return (
    <div className="flex flex-col items-start justify-start h-full flex-1 w-full max-w-[720px] lg:w-[700px] relative pt-[44] md:pt-[128] pb-[92] mx-auto">
      <Header />

      {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}

      {pageData && (
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={rectIntersection}
        >
          {pageData.blocks.map((block, index) => {
            const definition = BlockRegistry[block.type];
            if (!definition) return null;

            const Block = definition.component;

            return (
              <div key={block.id} className="w-full">
                <Spacer id={block.id} index={index} />
                {block.type === "section" && index >= 1 && (
                  <div className="h-[64]" />
                )}

                <BlockHandle index={index} id={block.id}>
                  <Block {...block.props} index={index} id={block.id} />
                </BlockHandle>
              </div>
            );
          })}

          <Spacer id={"end-block"} index={pageData.blocks.length} />
        </DndContext>
      )}

      {
        <div
          id="foreword"
          className="w-full min-h-[128px] h-full flex flex-1 cursor-text rounded-[8px] hover:bg-zinc-200/50 transition-colors duration-200"
          onClick={() => {
            const insertAt = state.data.pages[state.pageIndex].blocks.length;
            state.addBlock("text", insertAt);
            state.setSelectedIndex(insertAt);
          }}
        />
      }
    </div>
  );
}

/**
 *  {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
 *  <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={rectIntersection}
      >
        {state.data.blocks.map((block, index) => {
          const definition = BlockRegistry[block.type];
          if (!definition) return null;

          const Block = definition.component;

          return (
            <div key={block.id} className="w-full">
              <Spacer id={block.id} index={index} />
              {block.type === "section" && index >= 1 && (
                <div className="h-[64]" />
              )}

              <BlockHandle index={index} id={block.id}>
                <Block {...block.props} index={index} id={block.id} />
              </BlockHandle>
            </div>
          );
        })}

        <Spacer id={"end-block"} index={state.data.blocks.length} />
      </DndContext>

      
 */
