import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor-store";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const pages = useEditorStore((state) => state.data.pages);
  const pageIndex = useEditorStore((state) => state.pageIndex);
  const router = useRouter();

  const currentPage = () => {
    return pages[pageIndex]?.name ?? "home";
  };

  if (pages.length <= 1) return null;

  return (
    <div
      className="h-[44px] w-fit p-[8px] rounded-[16px] px-[20px] py-[16px] flex items-center justify-center gap-[24px] bg-zinc-900/90 backdrop-blur-xs shadow-sm fixed bottom-8 left-1/2 -translate-x-1/2"
      style={{
        zIndex: 100,
      }}
    >
      {pages.map((page) => {
        return (
          <p
            key={page.id}
            className={cn(
              "text-zinc-500 text-[16px] cursor-default",
              page.name === currentPage() && "text-zinc-100"
            )}
            onClick={() => {
              if (page.name === "home") {
                // Remove all search params by replacing with path only
                router.replace(window.location.pathname, { scroll: false });
                return;
              }
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("p", page.name);
              router.replace(`?${searchParams.toString()}`, { scroll: false });
            }}
          >
            {page.name.charAt(0).toUpperCase() +
              page.name.slice(1).toLocaleLowerCase()}
          </p>
        );
      })}
    </div>
  );
};

export default Navbar;
