import { useEditorStore } from "@/store/editor-store";
import { useSearchParams } from "next/navigation";

const usePage = () => {
  const searchParams = useSearchParams();
  const pageIndex = useEditorStore((s) => s.pageIndex);
  const setPageIndex = useEditorStore((s) => s.setPageIndex);

  const navigateToPage = (pageName: string) => {
    const url = new URL(window.location.href);
    if (pageName === "home") url.searchParams.delete("p");
    else url.searchParams.set("p", pageName);

    window.history.pushState(null, "", url.toString());
  };

  const pageName = searchParams.get("p") ?? "home";

  return {
    pageIndex,
    pageName,
    navigateToPage,
  };
};

export default usePage;
