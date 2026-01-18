import { useEffect, useRef, useState } from "react";
import { UpdateSiteAction } from "@/app/actions";
import { SiteObject } from "@/store/editor-store";


const useSync = (siteId: string, data: SiteObject, debounce = 1000) => {
    const isFirstRender = useRef(true);
  const prevState = useRef(data);
  const [isSyncing, setIsSyncing] = useState(false);


  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    } else if (
      JSON.stringify(data) !== JSON.stringify(prevState.current)
    ) {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        console.log("updating site...");
        setIsSyncing(true);
        UpdateSiteAction(siteId, data).finally(() => setIsSyncing(false));
        prevState.current = data;
      }, debounce);

      return () => clearTimeout(timeout);
    }
  }, [data]);

  return { isSyncing };
}

export default useSync;