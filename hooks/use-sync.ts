import { useEffect, useRef, useState } from "react";
import { UpdateSiteAction } from "@/app/actions";
import type { SiteObject } from "@/app/types";

const useSync = (siteId: string, data: SiteObject, debounce = 1000) => {
  const isFirstRender = useRef(true);
  const prevState = useRef<SiteObject>(data);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const [isSyncing, setIsSyncing] = useState(false);

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
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevState.current = data;
      return;
    }

    // shallow escape hatch — replace with hash / version if possible
    if (JSON.stringify(data) === JSON.stringify(prevState.current)) {
      return;
    }

    // cancel previous debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      setIsSyncing(true);

      try {
        await UpdateSiteAction(siteId, data);
        prevState.current = data;
      } finally {
        if (mountedRef.current) {
          setIsSyncing(false);
        }
      }
    }, debounce);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, siteId, debounce]);

  return { isSyncing };
};

export default useSync;
