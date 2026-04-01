import { create } from "zustand";

interface SelectionState {
  selection: Selection | null;
  activeEditorId: string | null;
  tick: number; // increment this to force updates
  isMultiSelection: boolean;
  setSelection: (
    selection: Selection | null,
    elementId: string | null,
    isMultiSelection?: boolean
  ) => void;
}
export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  activeEditorId: null,
  isMultiSelection: false,
  tick: 0,
  setSelection: (selection, activeEditorId, isMultiSelection = false) =>
    set((state) => ({
      selection,
      activeEditorId,
      isMultiSelection,
      tick: state.tick + 1,
    })),
}));
