"use client";

import { useEditorStore } from "@/store/editor-store";
import { DndContext, type DragEndEvent, rectIntersection } from "@dnd-kit/core";

import EditorCanvas from "./editor-canvas";
import Header from "./header";
import useSync from "@/hooks/use-sync";

import { useEffect, useState } from "react";

import type { SiteObject } from "@/app/types";
import useEditorSelection from "@/hooks/useEditorSelection";
import useBackspace from "@/hooks/useBackspace";
import usePageTracking from "@/hooks/use-page-tracking";

// editor-shell.tsx
export default function EditorShell({
  siteId,
  initialState,
}: {
  siteId: string;
  initialState: SiteObject;
}) {
  const initialize = useEditorStore((s) => s.initialize);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const pageData = useEditorStore((s) => s.data.pages[s.pageIndex]);
  const state = useEditorStore((s) => s);
  const [isInitialized, setIsInitialized] = useState(false);

  useEditorSelection();
  useBackspace();
  usePageTracking();
  useSync(siteId, isInitialized);

  // initializes state
  useEffect(() => {
    initialize(initialState);
    setIsInitialized(true);
  }, [initialState, initialize]);

  // clean up
  useEffect(() => {
    state.runCleanup();
  }, [state.selectedIndex]);

  /** event handlers */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  if (!isInitialized)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Initialzing editor...
      </div>
    );

  return (
    <div className="flex flex-col items-start justify-start h-full flex-1 w-full max-w-[700px] lg:w-[700px] relative select-none">
      <Header />
      <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={rectIntersection}
      >
        {<EditorCanvas blocks={pageData.blocks} />}

        {false && (
          <pre className="bg-zinc-100 rounded text-xs px-3 py-2 mb-2 max-w-2xl overflow-x-auto">
            {JSON.stringify(state, null, 2)}
            <br />
          </pre>
        )}
      </DndContext>
    </div>
  );
}
