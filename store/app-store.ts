import { create } from "zustand";

type AppState = {
  sonner: {
    title: string;
    message: string;
    timestamp: number;
  } | null;
};

type Actions = {
  setSonner: ({ title, message }: { title: string; message: string }) => void;
};

const useAppStore = create<AppState & Actions>((set, get) => ({
  sonner: null,
  setSonner: ({ title, message }) => {
    set({
      sonner: {
        title,
        message,
        timestamp: new Date().getTime(),
      },
    });
  },
}));

export default useAppStore;
