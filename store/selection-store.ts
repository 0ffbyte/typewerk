import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SelectionState {
  selection: Selection | null;
  meta: {
    isSelecting: boolean;
    isMultiSelection: boolean;
    activeEditorIds: string[];
    anchorIndex: number;
    tailIndex: number;
  };
  position: {
    x: number;
    y: number;
  };
}

interface Actions {
  clearSelection: () => void;
  setSelection: (updater: (draft: SelectionState) => void) => void;
}

type Store = SelectionState & Actions;

export const useSelectionStore = create<Store>()(
  immer<Store>((set) => ({
    selection: null,
    meta: {
      isSelecting: false,
      isMultiSelection: false,
      activeEditorIds: [],
      anchorIndex: 0,
      tailIndex: 0,
    },
    position: {
      x: 0,
      y: 0,
    },
    clearSelection: () => {
      set((s) => {
        s.selection = null;
        s.meta.isMultiSelection = false;
        s.meta.isSelecting = false;
        s.meta.activeEditorIds = [];
        s.meta.anchorIndex = 0;
        s.meta.tailIndex = 0;
        s.position.x = 0;
        s.position.y = 0;
      });
    },
    setSelection: (updater: (draft: SelectionState) => void) =>
      set((state) => updater(state as SelectionState)),
  }))
);
