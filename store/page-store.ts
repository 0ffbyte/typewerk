import { create } from "zustand";

export type PageState = {
  sectionIndex: number;
};

type Actions = {
  setSectionIndex: (index: number) => void;
};

export const usePageStore = create<PageState & Actions>()((set) => ({
  sectionIndex: 0,
  setSectionIndex: (index: number) =>
    set(() => ({
      sectionIndex: index,
    })),
}));
