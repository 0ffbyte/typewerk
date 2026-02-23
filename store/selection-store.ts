// stores/selectionStore.ts
import { create } from "zustand";

interface SelectionState {
  selection: Selection | null;
  activeEditorId: string | null;
  tick: number; // increment this to force updates
  setSelection: (selection: Selection | null, elementId: string | null) => void;
}
export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  activeEditorId: null,
  tick: 0,
  setSelection: (selection, activeEditorId) =>
    set((state) => ({ selection, activeEditorId, tick: state.tick + 1 })),
}));
