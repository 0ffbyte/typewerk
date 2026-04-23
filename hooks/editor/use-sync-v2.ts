import { useEditorStore } from "@/store/editor-store";
import { useEffect, useRef } from "react";
import type { SiteObject } from "@/app/types";

const DEBOUNCE_MS = 2000;

const useSyncV2 = (siteId: string) => {
  const data = useEditorStore((state) => state.data);
  const isInitialized = useEditorStore((state) => state.isInitialized);
  const prevData = useRef<SiteObject | null>(null);

  useEffect(() => {
    if (!isInitialized || !data) return;

    // Set baseline on first initialization, don't sync
    if (prevData.current === null) {
      prevData.current = data;
      return;
    }

    const handler = setTimeout(() => {
      const changed = (Object.keys(data) as (keyof SiteObject)[]).filter(
        (key) => !Object.is(prevData.current![key], data[key])
      );

      prevData.current = data;
      if (changed.length === 0) return;

      console.log("changed keys:", changed);
      console.log("payload:", data[changed[0]]);

      // todo: hit server action with siteId, payload & topic/key
    }, DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [isInitialized, data]);
};

export default useSyncV2;
