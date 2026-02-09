import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { BlockRegistry, BlockType } from "@/lib/block-registry";
import type { SiteObject } from "@/app/types";

export type EditorState = {
  data: SiteObject;
  pageIndex: number;
  selectedIndex: number;
  isSyncing: boolean;
  preventNewLine: boolean;
};

type Actions = {
  initialize: (data: SiteObject) => void;
  setState: (updater: (draft: EditorState) => void) => void;
  setPageIndex: (index: number) => void;
  setSelectedIndex: (index: number) => void;
  addBlock: (type: BlockType, index: number) => void;
  removeBlock: (index: number) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  addPage: (name?: string) => void;
  removePage: (pageIndex: number) => void;
};

export const useEditorStore = create<EditorState & Actions>()(
  immer<EditorState & Actions>((set) => ({
    data: {
      header: {
        image: "",
        heading: "",
        subheading: "",
      },
      pages: [],
      hasArticles: false,
    },
    pageIndex: 0,
    selectedIndex: 0,
    isSyncing: false,
    preventNewLine: false,
    setSelectedIndex: (index: number) =>
      set((s) => {
        s.selectedIndex = index;
      }),
    setPageIndex: (index: number) =>
      set((s) => {
        s.pageIndex = index;
      }),
    addBlock: (type: BlockType, index: number) =>
      set((s) => {
        const def = BlockRegistry[type];
        s.data.pages[s.pageIndex].blocks.splice(index, 0, {
          id: crypto.randomUUID(),
          type,
          props: def.defaultProps,
        });
        s.selectedIndex = index;
      }),
    removeBlock: (index: number) =>
      set((s) => {
        s.data.pages[s.pageIndex].blocks.splice(index, 1);
        s.selectedIndex = Math.max(-1, index - 1);
      }),
    setState: (updater: (draft: EditorState) => void) =>
      set((state) => {
        updater(state);
      }),
    initialize: (data: SiteObject) =>
      set((state) => {
        state.data = data;
      }),
    reorderBlocks: (activeId: string, overId: string) =>
      set((s) => {
        const blocks = s.data.pages[s.pageIndex].blocks;
        if (!blocks) return;

        const activeIndex = blocks.findIndex((block) => block.id === activeId);
        let overIndex = blocks.findIndex((block) => block.id === overId);

        if (overId === "end-block") {
          overIndex = blocks.length;
        } else if (activeIndex <= overIndex && overIndex !== -1) {
          overIndex = overIndex - 1;
        }

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          const [removed] = blocks.splice(activeIndex, 1);
          blocks.splice(overIndex, 0, removed);
          s.selectedIndex = overIndex;
        }
      }),
    addPage: (name: string = "Page") =>
      set((s) => {
        const url = new URL(window.location.href);
        url.searchParams.set("p", name);
        if (s.data.pages.length >= 4) return;
        s.data.pages.push({
          id: crypto.randomUUID(),
          name,
          blocks: [
            {
              id: crypto.randomUUID(),
              type: "text",
              props: {
                content: "This is " + name,
              },
            },
          ],
        });
        window.history.pushState(null, "", url.toString());
        s.selectedIndex = 0;
      }),
    removePage: (pageIndex: number) =>
      set((s) => {
        const url = new URL(window.location.href);
        url.searchParams.delete("p");
        s.data.pages.splice(pageIndex, 1);
        if (s.pageIndex >= s.data.pages.length) {
          s.pageIndex = s.data.pages.length - 1;
        }
        window.history.pushState(null, "", url.toString());
        s.selectedIndex = 0;
      }),
  }))
);
