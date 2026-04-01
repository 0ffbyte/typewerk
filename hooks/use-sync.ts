import { useEffect, useRef } from "react";
import { UpdateSiteAction } from "@/app/actions";
import type { SiteObject } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";

const useSync = (
  siteId: string,
  data: SiteObject,
  isInitialized: boolean,
  debounce = 2000
) => {
  const setState = useEditorStore((s) => s.setState);
  const prevState = useRef<SiteObject>(data);

  const hasBaselineRef = useRef(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // track mount state
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    // if there is no baseline, set it so we can compare against it
    if (!hasBaselineRef.current) {
      prevState.current = data;
      hasBaselineRef.current = true;
      return;
    }

    // if the data is the same as the baseline, do nothing
    if (JSON.stringify(data) === JSON.stringify(prevState.current)) return;

    // clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; // ← always null after clearing
    }

    // define a new timeout
    timeoutRef.current = setTimeout(async () => {
      timeoutRef.current = null; // ← null once it fires
      if (!mountedRef.current) return;

      setState((s) => {
        s.isSyncing = true;
      });

      try {
        await UpdateSiteAction(siteId, data);
        prevState.current = data;
      } finally {
        if (mountedRef.current) {
          setState((s) => {
            s.isSyncing = false;
          });
        }
      }
    }, debounce);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null; // ← same here
      }
    };
  }, [data, siteId, debounce, isInitialized]);
};

export default useSync;
