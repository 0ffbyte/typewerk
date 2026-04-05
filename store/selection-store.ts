import { create } from "zustand";

interface SelectionState {
  selection: Selection | null;
  isMultiSelection: boolean;
  activeEditorIds: string[];
  anchorIndex: number;
  tailIndex: number;
  tick: number; // increment this to force updates
  setSelection: (
    selection: Selection | null,
    isMultiSelection: boolean,
    activeEditorIds: string[],
    anchorIndex?: number,
    tailIndex?: number
  ) => void;
}
export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  isMultiSelection: false,
  activeEditorIds: [],
  anchorIndex: 0,
  tailIndex: 0,
  tick: 0,
  setSelection: (
    selection,
    isMultiSelection = false,
    activeEditorIds,
    anchorIndex = 0,
    tailIndex = 0
  ) =>
    set((state) => ({
      selection,
      isMultiSelection,
      activeEditorIds,
      anchorIndex,
      tailIndex,
      tick: state.tick + 1,
    })),
}));
