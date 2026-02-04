import { useEffect, useRef, useState } from "react";
import { UpdateSiteAction } from "@/app/actions";
import type { SiteObject } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";

const useSync = (
  siteId: string,
  data: SiteObject,
  isInitialized: boolean,
  debounce = 1000
) => {
  const setState = useEditorStore((s) => s.setState);
  const prevState = useRef<SiteObject>(data);
  const hasBaselineRef = useRef(false);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // track mount state
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    // 👇 first initialized run = baseline, not a sync
    if (!hasBaselineRef.current) {
      prevState.current = data;
      hasBaselineRef.current = true;
      return;
    }

    // shallow escape hatch — replace with hash / version if possible
    if (JSON.stringify(data) === JSON.stringify(prevState.current)) return;

    // cancel previous debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      setState((s) => {
        s.isSyncing = true;
      });

      try {
        console.log("syncing...");
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
      }
    };
  }, [data, siteId, debounce]);
};

export default useSync;
