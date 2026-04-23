import { useEditorStore } from "@/store/editor-store";
import { useEffect } from "react";

const useHistory = () => {
  const { undo, redo } = useEditorStore.temporal.getState();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLocaleLowerCase() === "z") {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.key.toLocaleLowerCase() === "z") {
        e.preventDefault();
        undo();
        console.log("history tapped");
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
};

export default useHistory;
