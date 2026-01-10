import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor-store";
import { UpdateSiteAction } from "@/app/actions";

const useSync = (siteId: string, debounce: number = 1000) => {
  const data = useEditorStore((state) => state.data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const lastSyncedData = useRef<string | null>(null);

  useEffect(() => {
    // Skip sync on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      lastSyncedData.current = JSON.stringify(data);
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      const currentData = JSON.stringify(data);

      // Only sync if data actually changed
      if (currentData !== lastSyncedData.current) {
        try {
          await UpdateSiteAction(siteId, data);
          lastSyncedData.current = currentData;
          console.log("Site synced successfully");
        } catch (error) {
          console.error("Failed to sync site:", error);
          // You could add error handling/retry logic here
        }
      }
    }, debounce);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, siteId, debounce]);
};

export default useSync;
