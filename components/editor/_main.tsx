"use client";

import { useEffect, useMemo, useState } from "react";
import { rectIntersection, DndContext, DragEndEvent } from "@dnd-kit/core";

import Header from "@/components/editor/header";
import BlockHandle from "@/components/editor/block-wrapper";
import Spacer from "@/components/editor/spacer";
import SiteCard from "@/components/site-card";

import usePage from "@/hooks/use-page";
import useSync from "@/hooks/use-sync";

import { motion } from "motion/react";

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
  const { pageName, isEmpty } = usePage();

  const state = useEditorStore();
  const setState = useEditorStore((s) => s.setState);

  const setSelection = useSelectionStore((s) => s.setSelection);
  const isMultiline = useSelectionStore((s) => s.isMultiSelection);

  // gets page data using page index
  const pageData = useMemo(() => {
    return state.data.pages[state.pageIndex];
  }, [state.pageIndex, state.data.pages]);

  // initializes state
  useEffect(() => {
    state.initialize(initialState);
    setIsInitialized(true);
  }, [initialState, state.initialize]);

  // setup global selection listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setSelection(null, null);
        return;
      }

      if (!selection.isCollapsed) {
        setState((s) => {
          s.isEditable = false;
        });
      }

      const anchor = selection.anchorNode;
      const editorEl = (
        anchor instanceof Element ? anchor : anchor?.parentElement
      )?.closest("[data-editor-id]");

      const allEditorElements = document.querySelectorAll(
        "[data-class='editor-contenteditable']"
      );

      const selectedEditorElementsCount = Array.from(allEditorElements).filter(
        (el) => selection.containsNode(el, true)
      ).length;

      const isMultiSelection = selectedEditorElementsCount > 1;
      if (selectedEditorElementsCount > 1) {
        console.log(
          `Selection spans ${selectedEditorElementsCount} editor elements`
        );
      }

      const editorId = editorEl?.getAttribute("data-editor-id") ?? null;

      setSelection(selection, editorId, isMultiSelection);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      setState((s) => {
        s.isEditable = true;
      });

      const selection = document.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        console.log("no selection by handlerTwo");
      } else if (e.key === "Backspace" && isMultiline) {
        //e.preventDefault();
        const range = selection.getRangeAt(0);
        range.deleteContents();
        setState((s) => (s.selectedIndex = -1));

        // Broadcast an input event to all elements with [data-editor-id] attribute
        const allEditorElements = document.querySelectorAll(
          "[data-class='editor-contenteditable']"
        );

        allEditorElements.forEach((el) => {
          console.log("el:", el);
          const inputEvent = new Event("input", { bubbles: true });
          el.dispatchEvent(inputEvent);
        });
      } else if (e.key === "Backspace" && !isMultiline) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Broadcast an input event to all elements with [data-editor-id] attribute
        const allEditorElements = document.querySelectorAll(
          "[data-class='editor-contenteditable']"
        );

        allEditorElements.forEach((el) => {
          console.log("el:", el);
          const inputEvent = new Event("input", { bubbles: true });
          el.dispatchEvent(inputEvent);
        });

        // perform cleanup
        state.runCleanup();
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // updates page index on page name change
  useEffect(() => {
    const foundIndex = state.data.pages.findIndex((p) => p.name === pageName);
    state.setPageIndex(foundIndex !== -1 ? foundIndex : 0);
  }, [pageName, state.data.pages, state.setPageIndex]);

  useEffect(() => {
    state.runCleanup();
  }, [state.selectedIndex]);

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
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.1,
                  }}
                  layout="position"
                  key={block.id}
                  className="w-full"
                >
                  <Spacer id={block.id} index={index} />
                  {block.type === "section" && index >= 1 && (
                    <div className="h-[64px] hover:bg-rose-400/10 w-full rounded-lg transition-colors duration-100 cursor-not-allowed" />
                  )}

                  <BlockHandle index={index} id={block.id}>
                    <Block {...block.props} index={index} id={block.id} />
                  </BlockHandle>
                </motion.div>
              );
            })}

            <Spacer id={"end-block"} index={pageData.blocks.length} />
          </DndContext>

          {isEmpty ? (
            <div className="w-full h-fit space-y-4 flex flex-col items-start justify-start px-1 mt-[92px]">
              <p className="text-sm text-muted-foreground">Page Templates</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 md:gap-y-8 w-full">
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
