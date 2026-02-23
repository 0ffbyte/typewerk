"use client";

import { useEffect, useMemo, useState } from "react";
import { rectIntersection, DndContext, DragEndEvent } from "@dnd-kit/core";

import Header from "@/components/editor/header";
import BlockHandle from "@/components/editor/block-wrapper";
import Spacer from "@/components/editor/spacer";

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
  const { pageName } = usePage();

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

  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized)
      document.title = state.data.header.heading.slice(0, 8) + " | Typewerk";
  }, [isInitialized, state.data.header.heading]);

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
    <div className="flex flex-col items-start justify-start h-full flex-1 w-full max-w-[720px] lg:w-[720px] relative">
      <Header />

      {false && (
        <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
          {JSON.stringify(state.selectedIndex, null, 2)}
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
                  <div className="h-[92] hover:bg-rose-100 w-full rounded transition-colors duration-200 cursor-not-allowed" />
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
          className="w-full min-h-[512px] h-full flex flex-1 cursor-text rounded-[8px] hover:bg-zinc-200/50 transition-colors duration-200"
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
