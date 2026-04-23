"use client";
import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent, rectIntersection } from "@dnd-kit/core";

import Header from "./header";
import EditorCanvas from "./editor-canvas";
import SelectionToolbar from "./selection-toolbar";

import type { SiteObject } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";

import useSyncV2 from "@/hooks/editor/use-sync-v2";
import useHistory from "@/hooks/editor/use-history";
import useShorcuts from "@/hooks/editor/use-shortcuts";
import useBackspace from "@/hooks/editor/use-backspace";
import usePageTracking from "@/hooks/editor/use-page-tracking";
import useSelectionTracking from "@/hooks/editor/use-selection-tracking";

// editor-shell.tsx
export default function EditorShell({
  siteId,
  initialState,
}: {
  siteId: string;
  initialState: SiteObject;
}) {
  const state = useEditorStore((s) => s);
  const initialize = useEditorStore((s) => s.initialize);
  const [isInitialized, setIsInitialized] = useState(false);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const pageData = useEditorStore((s) => s.data.pages[s.pageIndex]);

  useSyncV2(siteId);
  useHistory();
  useShorcuts();
  useBackspace();
  usePageTracking();
  useSelectionTracking();

  // initializes state
  useEffect(() => {
    initialize(initialState);
    setIsInitialized(true);
  }, [initialState, initialize]);

  // clean up
  useEffect(() => {
    // state.runCleanup();
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
      <div className="min-w-screen min-h-screen flex flex-col items-center justify-center">
        Initialzing editor...
      </div>
    );

  return (
    <div
      id="root"
      className="flex flex-col items-start justify-start h-full flex-1 w-full max-w-[648px] lg:w-[648px] pt-[92px] select-none"
    >
      <Header />
      <DndContext
        onDragEnd={handleDragEnd}
        collisionDetection={rectIntersection}
      >
        <EditorCanvas blocks={pageData.blocks} />
        <SelectionToolbar />
      </DndContext>

      <Foreword blockLength={pageData.blocks.length} />
      {true && <Debugger />}
    </div>
  );
}

// DEBUGGER
import { useSelectionStore } from "@/store/selection-store";
const Debugger = () => {
  const state = useEditorStore((s) => s);
  const selection = useSelectionStore((s) => s);

  const [currentData, setCurrentData] = useState<
    "selection" | "editor" | "hidden"
  >("editor");

  if (currentData === "hidden") return null;

  return (
    <pre className="bg-black/10 text-xs fixed top-0 left-0 w-[400px] h-[600px] overflow-scroll">
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setCurrentData("selection")}
          className={`px-2 py-1 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition ${
            currentData === "selection"
              ? "font-bold border-b-2 border-blue-400"
              : ""
          }`}
        >
          selection
        </button>
        <button
          onClick={() => setCurrentData("editor")}
          className={`px-2 py-1 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition ${
            currentData === "editor"
              ? "font-bold border-b-2 border-blue-400"
              : ""
          }`}
        >
          editor
        </button>
        <button
          onClick={() => setCurrentData("hidden")}
          className="px-2 py-1 rounded bg-zinc-700 text-zinc-100 hover:bg-zinc-600 transition"
        >
          hide
        </button>
      </div>
      {JSON.stringify(currentData === "selection" ? selection : state, null, 2)}
      <br />
    </pre>
  );
};

const Foreword = ({ blockLength }: { blockLength: number }) => {
  const addBlock = useEditorStore((s) => s.addBlock);
  const setSelectedIndex = useEditorStore((s) => s.setSelectedIndex);

  return (
    <div
      title="write"
      id="foreword"
      className="w-full min-h-[512px] h-full flex flex-1 cursor-text rounded-[8px] hover:bg-zinc-200/0 transition-colors duration-200"
      onClick={() => {
        const insertAt = blockLength;
        addBlock("text", insertAt);
        setSelectedIndex(insertAt);
      }}
    />
  );
};
