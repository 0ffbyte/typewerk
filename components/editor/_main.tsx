"use client";

import { useEffect, useMemo, useState } from "react";
import { rectIntersection, DndContext, DragEndEvent } from "@dnd-kit/core";

import Header from "@/components/editor/header";
import BlockHandle from "@/components/editor/block-wrapper";
import Spacer from "@/components/editor/spacer";
import SiteCard from "@/components/site-card";

import usePage from "@/hooks/use-page";
import useSync from "@/hooks/use-sync";

import { useEditorStore } from "@/store/editor-store";
import { useSelectionStore } from "@/store/selection-store";

import { BlockRegistry } from "@/lib/block-registry";

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
  const { pageName, isEmpty } = usePage();

  const setSelection = useSelectionStore((s) => s.setSelection);

  // setup selection listener
  useEffect(() => {
    const handler = () => {
      const selection = document.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelection(null, null);
        return;
      }

      const anchor = selection.anchorNode;
      const editorEl = (
        anchor instanceof Element ? anchor : anchor?.parentElement
      )?.closest("[data-editor-id]");

      const editorId = editorEl?.getAttribute("data-editor-id") ?? null;

      setSelection(selection, editorId);
    };

    document.addEventListener("selectionchange", handler);

    return () => {
      document.removeEventListener("selectionchange", handler);
    };
  }, []);

  // updates page index on page name change
  useEffect(() => {
    const foundIndex = state.data.pages.findIndex((p) => p.name === pageName);
    state.setPageIndex(foundIndex !== -1 ? foundIndex : 0);
  }, [pageName, state.data.pages, state.setPageIndex]);

  // gets page data using page index
  const pageData = useMemo(() => {
    return state.data.pages[state.pageIndex];
  }, [state.pageIndex, state.data.pages]);

  // initializes state
  useEffect(() => {
    state.initialize(initialState);
    setIsInitialized(true);
  }, [initialState, state.initialize]);

  // syncs state with db
  useSync(siteId, state.data, isInitialized);

  /** event handlers */
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
    <div className="flex flex-col items-start justify-start h-full flex-1 w-full max-w-[700px] lg:w-[700px] relative">
      <Header />

      {true && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state.data.pages[state.pageIndex].blocks, null, 2)}

          <br />
        </pre>
      )}

      {pageData && (
        <>
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
                    <div className="h-[92] hover:bg-rose-100 w-full rounded-lg transition-colors duration-100 cursor-not-allowed" />
                  )}

                  <BlockHandle index={index} id={block.id}>
                    <Block {...block.props} index={index} id={block.id} />
                  </BlockHandle>
                </div>
              );
            })}

            <Spacer id={"end-block"} index={pageData.blocks.length} />
          </DndContext>

          {isEmpty ? (
            <div className="w-full h-fit space-y-4 flex flex-col items-start justify-start px-1 mt-[92px]">
              <p className="text-sm text-muted-foreground">Page Templates</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 w-full">
                <SiteCard
                  thumbnail="https://i.pinimg.com/1200x/6f/77/28/6f772804bad7c7a19f1cdfcf3dab5b3d.jpg"
                  title="Portfolio"
                  subtitle="Minimal portfolio page template."
                />

                <SiteCard
                  thumbnail="https://i.pinimg.com/736x/d0/3e/c6/d03ec618769707dfabddda5a801ba4b6.jpg"
                  title="Curriculum Vitae"
                  subtitle="Simple cv page template."
                />

                <SiteCard
                  thumbnail="https://i.pinimg.com/1200x/58/6b/5e/586b5e4a904858e386bbc3df7341fd1c.jpg"
                  title="Docs"
                  subtitle="Documentation page template."
                />
              </div>
            </div>
          ) : (
            <div
              id="foreword"
              className="w-full min-h-[512px] h-full flex flex-1 cursor-text rounded-[8px] hover:bg-zinc-200/0 transition-colors duration-200"
              onClick={() => {
                const insertAt = pageData.blocks.length;
                state.addBlock("text", insertAt);
                state.setSelectedIndex(insertAt);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
