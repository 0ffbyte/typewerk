import { useEditorStore } from "@/store/editor-store";
import { useSearchParams } from "next/navigation";

const usePage = () => {
  const searchParams = useSearchParams();
  const pageIndex = useEditorStore((s) => s.pageIndex);
  const pageData = useEditorStore((s) => s.data.pages[s.pageIndex]);

  const isEmpty =
    pageData?.blocks.length === 1 &&
    pageData.blocks[0].type === "text" &&
    pageData.blocks[0].props.content
      .replace(/<br\s*\/?>/gi, "")
      .replace(/<\/(div|p|li|h[1-6]|pre)>/gi, "")
      .replace(/<[^>]+>/g, "") === ""; // content is html so we remove all unnecessary tags

  const navigateToPage = (pageName: string) => {
    const url = new URL(window.location.href);
    if (pageName === "home") url.searchParams.delete("p");
    else {
      url.searchParams.set("p", pageName);
      url.hash = ""; // remove any anchor #sections
    }

    window.history.pushState(null, "", url.toString());
  };

  const pageName = searchParams.get("p") ?? "home";

  return {
    pageIndex,
    pageName,
    isEmpty,
    navigateToPage,
  };
};

export default usePage;
