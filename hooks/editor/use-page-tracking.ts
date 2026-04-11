// tracks & sets page index based on current page name
import { useEditorStore } from "@/store/editor-store";
import { useSearchParams } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { useEffect } from "react";

const usePageTracking = () => {
  const searchParams = useSearchParams();
  const setPageIndex = useEditorStore((s) => s.setPageIndex);
  const pageNames = useEditorStore(
    useShallow((s) => s.data.pages.map((p) => p.name))
  );

  const pageName = searchParams.get("p") ?? "home";

  // updates page index on page name change
  useEffect(() => {
    console.log("page names:", pageNames);
    const foundIndex = pageNames.findIndex(
      (name) => name.toLowerCase() === pageName.toLowerCase()
    );
    console.log("found index:", foundIndex, "page name:", pageName);
    setPageIndex(foundIndex !== -1 ? foundIndex : 0);
  }, [pageName, pageNames, setPageIndex]);
};

export default usePageTracking;
