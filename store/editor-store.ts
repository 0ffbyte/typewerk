import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { BlockRegistry, BlockType } from "@/lib/block-registry";
import type { Block } from "@/app/types";

export type SiteObject = EditorState["data"];

export type EditorState = {
  data: {
    title: string;
    header: {
      image: string;
      heading: string;
      subheading: string;
    };
    blocks: Block[];
  };
  selectedIndex: number;
  insertBehavior: "append" | "prepend" | "replace";
};

type Actions = {
  initialize: (data: SiteObject) => void;
  setState: (updater: (draft: EditorState) => void) => void;
  setSelectedIndex: (index: number) => void;
  addBlock: (type: BlockType, index: number) => void;
  removeBlock: (index: number) => void;
};

export const useEditorStore = create<EditorState & Actions>()(
  subscribeWithSelector(
    immer<EditorState & Actions>((set) => ({
      data: {
        title: "",
        header: {
          image:
            "https://i.pinimg.com/1200x/ba/28/b6/ba28b69fae45e39a232b71a2363fe770.jpg",
          heading: "Typewerk",
          subheading: "Your Ultra Minimal Site Builder",
        },
        blocks: [
          {
            uuid: crypto.randomUUID(),
            type: "text",
            props: {
              content: "Welcome to Typewerk!",
            },
          },
        ],
      },
      selectedIndex: 0,
      insertBehavior: "append",
      setSelectedIndex: (index: number) =>
        set((state) => {
          state.selectedIndex = index;
        }),
      addBlock: (type: BlockType, index: number) =>
        set((state) => {
          const definition = BlockRegistry[type];
          state.data.blocks.splice(index, 0, {
            uuid: crypto.randomUUID(),
            type,
            props: definition.defaultProps,
          } as Block);
          state.selectedIndex = index;
        }),
      removeBlock: (index: number) =>
        set((state) => {
          state.data.blocks.splice(index, 1);
          state.selectedIndex = Math.max(0, index - 1);
        }),
      setState: (updater: (draft: EditorState) => void) =>
        set((state) => {
          updater(state);
        }),
      initialize: (data: SiteObject) =>
        set((state) => {
          state.data = data;
        }),
    }))
  )
);
