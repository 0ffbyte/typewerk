"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import usePage from "@/hooks/use-page";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { RevalidateSiteAction } from "@/app/actions";

import { ChevronDown, PlusIcon, XIcon } from "lucide-react";
import { cn, slugify } from "@/lib/utils";

const PageDropdown = () => {
  const setState = useEditorStore((s) => s.setState);
  const pages = useEditorStore((s) => s.data.pages);
  const { pageIndex, pageName, navigateToPage } = usePage();

  const addPage = useEditorStore((s) => s.addPage);
  const removePage = useEditorStore((s) => s.removePage);

  const [isOpen, setIsOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  const commitName = () => {
    if (draftName.trim() === "") {
      setEditIndex(null);
      return;
    }

    const newPageName = slugify(draftName) || "Page";
    setState((s) => {
      s.data.pages[s.pageIndex].name = newPageName;
    });
    setEditIndex(null);
    navigateToPage(newPageName);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-[148px] h-full hover:bg-white/10 text-zinc-200 rounded-[12px] flex items-center justify-between px-[12px]",
            isOpen && "bg-white/10"
          )}
        >
          <p className="text-ellipsis overflow-hidden whitespace-nowrap">
            Page{" "}
            <span className="text-zinc-500">
              {pageIndex === 0 ? "Home" : pageName}
            </span>
          </p>

          <ChevronDown
            size={20}
            strokeLinecap="square"
            className={cn(
              "text-zinc-500 transition-all duration-100",
              isOpen && "rotate-180 text-zinc-200"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="max-w-[164px] bg-zinc-900/80 backdrop-blur-xs shadow-sm text-zinc-200 rounded-[16px] p-[4px] space-y-[4px]"
        onFocusOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="h-[38px] px-[8px] flex items-center justify-between">
          <p>Page</p>

          <button
            onClick={() => {
              const name = "Page" + (pages.length + 1).toString();
              addPage(name);
            }}
          >
            <PlusIcon
              className="text-zinc-200"
              size={20}
              strokeLinecap="square"
            />
          </button>
        </div>

        {pages.map((page, index) => {
          const isEditing = editIndex === index;

          return (
            <div
              key={page.id}
              className={cn(
                "flex items-center justify-between px-[8px] py-[4px] rounded-[12px] cursor-default hover:bg-white/10 group",
                isEditing && "ring-2 ring-accent",
                pageIndex === index && "bg-white/10"
              )}
              onDoubleClick={(e) => {
                if (index === 0) return;

                setEditIndex(index);
                setDraftName(page.name);
              }}
            >
              {index === 0 ? (
                <p
                  onClick={() => {
                    if (isEditing) return;

                    navigateToPage(page.name);
                  }}
                  className="w-full"
                >
                  Home
                </p>
              ) : isEditing ? (
                <input
                  className="w-full bg-transparent outline-none"
                  value={draftName}
                  maxLength={12}
                  autoFocus
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commitName()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitName();
                    }
                  }}
                />
              ) : (
                <>
                  <p
                    onClick={() => {
                      if (isEditing) return;

                      navigateToPage(page.name);
                    }}
                    className="w-full"
                  >
                    {page.name}
                  </p>

                  <button
                    onClick={() => {
                      removePage(index);
                    }}
                    className="group-hover:block hidden cursor-pointer"
                  >
                    <XIcon
                      className="text-zinc-500"
                      size={20}
                      strokeLinecap="square"
                    />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

const StyleDropdown = () => {
  const setState = useEditorStore((s) => s.setState);
  const pages = useEditorStore((s) => s.data.pages);
  const { pageIndex, pageName, navigateToPage } = usePage();

  const addPage = useEditorStore((s) => s.addPage);
  const removePage = useEditorStore((s) => s.removePage);

  const [isOpen, setIsOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");

  const commitName = () => {
    if (draftName.trim() === "") {
      setEditIndex(null);
      return;
    }

    const newPageName = draftName.replace(" ", "").trim() || "Page";
    setState((s) => {
      s.data.pages[s.pageIndex].name = newPageName;
    });
    setEditIndex(null);
    navigateToPage(newPageName);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-fit gap-[8px] h-full hover:bg-white/10 text-zinc-200 rounded-[12px] flex items-center justify-between px-[12px]",
            isOpen && "bg-white/10"
          )}
        >
          <p className="text-ellipsis overflow-hidden whitespace-nowrap">
            Style
          </p>

          <ChevronDown
            size={20}
            strokeLinecap="square"
            className={cn(
              "text-zinc-500 transition-all duration-100",
              isOpen && "rotate-180 text-zinc-200"
            )}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={8}
        className="max-w-[164px] bg-zinc-900/90 backdrop-blur-xs shadow-sm text-zinc-200 rounded-[16px] p-[4px] space-y-[4px]"
        onFocusOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="h-[38px] px-[8px] flex items-center justify-between">
          <p>Page</p>

          <button
            onClick={() => {
              const name = "Page" + (pages.length + 1).toString();
              addPage(name);
            }}
          >
            <PlusIcon
              className="text-zinc-200"
              size={20}
              strokeLinecap="square"
            />
          </button>
        </div>

        {pages.map((page, index) => {
          const isEditing = editIndex === index;

          return (
            <div
              key={page.id}
              className={cn(
                "flex items-center justify-between px-[8px] py-[4px] rounded-[12px] cursor-default hover:bg-white/10 group",
                isEditing && "ring-2 ring-accent",
                pageIndex === index && "bg-white/10"
              )}
              onDoubleClick={(e) => {
                if (index === 0) return;

                setEditIndex(index);
                setDraftName(page.name);
              }}
            >
              {index === 0 ? (
                <p
                  onClick={() => {
                    if (isEditing) return;

                    navigateToPage(page.name);
                  }}
                  className="w-full"
                >
                  Home
                </p>
              ) : isEditing ? (
                <input
                  className="w-full bg-transparent outline-none"
                  value={draftName}
                  maxLength={12}
                  autoFocus
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => commitName()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitName();
                    }
                  }}
                />
              ) : (
                <>
                  <p
                    onClick={() => {
                      if (isEditing) return;

                      navigateToPage(page.name);
                    }}
                    className="w-full"
                  >
                    {page.name}
                  </p>

                  <button
                    onClick={() => {
                      removePage(index);
                    }}
                    className="group-hover:block hidden cursor-pointer"
                  >
                    <XIcon
                      className="text-zinc-500"
                      size={20}
                      strokeLinecap="square"
                    />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};

const PublishButton = ({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) => {
  const isSyncing = useEditorStore((s) => s.isSyncing);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUptoDate, setIsUptoDate] = useState(true);

  const initial = useRef(true);

  useEffect(() => {
    !initial.current && setIsUptoDate(false);
    initial.current = false;
  }, [isSyncing]);

  const handleClick = async () => {
    if (isSyncing || isPublishing) return;

    if (isUptoDate) {
      const url = `${window.location.origin}/${subdomain}`;
      await navigator.clipboard.writeText(url);
      return;
    }

    setIsPublishing(true);
    RevalidateSiteAction(siteId).finally(() => {
      setIsPublishing(false);
      setIsUptoDate(true);
    });
  };

  return (
    <button
      className={cn(
        "w-[100px] h-full bg-blue-500 text-blue-100 rounded-[12px] flex items-center justify-center px-[12px] transition-colors duration-200",
        (isSyncing || isPublishing) && "cursor-wait bg-blue-400"
      )}
      style={{
        boxShadow: "0px 1px 2px 0px rgba(255, 255, 255, 0.6) inset",
      }}
      onClick={handleClick}
      disabled={isSyncing || isPublishing}
    >
      {isSyncing
        ? "Saving"
        : isPublishing
        ? "Publishing"
        : isUptoDate
        ? "Copy URL"
        : "Publish"}
    </button>
  );
};

const Toolbar = ({
  siteId,
  subdomain,
}: {
  siteId: string;
  subdomain: string;
}) => {
  return (
    <div className="h-[44px] w-fit rounded-[16px] p-[4px] border border-white/20 flex items-center gap-[12px] bg-zinc-900/80 backdrop-blur-xs shadow-sm fixed bottom-[24px] left-1/2 -translate-x-1/2 z-10">
      <PageDropdown />
      <StyleDropdown />
      <div className="w-px h-full bg-white/10" />
      <PublishButton siteId={siteId} subdomain={subdomain} />
    </div>
  );
};

export default Toolbar;
