"use client";

// Store and hooks
import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import usePage from "@/hooks/use-page";
import { useTheme } from "next-themes";

// Utils
import { cn, slugify } from "@/lib/utils";
import { THEME_MAPPING } from "@/lib/utils";

// UI components
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "../ui/select";

// Icons
import { ChevronDown, LoaderIcon } from "lucide-react";
import { PlusIcon } from "@radix-ui/react-icons";

// Actions
import { RevalidateSiteAction } from "@/app/actions";
import { Accent } from "@/app/types";

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
            "w-[148px] h-full hover:bg-white/5 text-zinc-200 rounded-[12px] flex items-center justify-between px-[12px]",
            isOpen && "bg-white/5"
          )}
        >
          <p className="text-ellipsis overflow-hidden whitespace-nowrap">
            Page{" "}
            <span className="text-zinc-500 capitalize">
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
        sideOffset={12}
        className="max-w-[164px] bg-zinc-900/80 border-border/20 backdrop-blur-xs shadow-sm text-zinc-200 rounded-[16px] p-[4px] space-y-[4px]"
        onFocusOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="h-[38px] px-[8px] flex items-center justify-between">
          <p className="text-sm text-zinc-400">Page</p>

          <button
            onClick={() => {
              const name = "Page" + (pages.length + 1).toString();
              addPage(name);
            }}
          >
            <PlusIcon />
          </button>
        </div>

        {pages.map((page, index) => {
          const isEditing = editIndex === index;

          return (
            <div
              key={page.id}
              className={cn(
                "flex items-center justify-between px-[8px] py-[4px] rounded-[12px] cursor-default hover:bg-white/5 group",
                isEditing && "ring-2 ring-accent",
                pageIndex === index && "bg-white/5"
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
                    className="w-full capitalize"
                  >
                    {page.name}
                  </p>

                  <button
                    title="Delete"
                    onClick={() => {
                      removePage(index);
                    }}
                    className="group-hover:block hidden cursor-pointer"
                  >
                    <PlusIcon className="text-zinc-500 rotate-45" />
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

const ThemeDropdown = () => {
  const theme = useEditorStore((s) => s.data.theme);
  const setState = useEditorStore((s) => s.setState);

  const [isOpen, setIsOpen] = useState(false);

  const { setTheme, theme: nextTheme } = useTheme();

  const handleAccentChange = (value: Accent) => {
    setState((s) => {
      s.data.theme.accent = value;
    });
  };

  const handleTypographyChange = (value: "sans" | "mono") => {
    setState((s) => {
      s.data.theme.typography = value;
    });
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-fit gap-[8px] h-full hover:bg-white/5 text-zinc-200 rounded-[12px] flex items-center justify-between px-[12px]",
            isOpen && "bg-white/5"
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
        sideOffset={12}
        className="w-[200px] bg-zinc-900/80 border-border/20 backdrop-blur-xs shadow-sm text-zinc-200 rounded-[16px] p-[4px] space-y-[4px]"
        onFocusOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="my-[8px] px-[8px] flex items-center justify-between">
          <p className="text-sm text-zinc-400">Style</p>
        </div>

        <div className="flex items-center justify-between pl-[8px] py-[2px] h-[32px] rounded-lg cursor-default hover:bg-white/5  group text-sm">
          Accent
          <Select
            defaultValue={theme?.accent}
            onValueChange={handleAccentChange}
          >
            <SelectTrigger
              className="w-[100px] border-none capitalize"
              size="sm"
            >
              <SelectValue placeholder="Select an accent" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-200 border-border/20">
              <SelectGroup>
                <SelectLabel>Accent</SelectLabel>
                {Object.keys(THEME_MAPPING.accent).map((accent) => (
                  <SelectItem
                    key={accent}
                    value={accent}
                    className="capitalize focus:bg-white/5 focus:text-zinc-200"
                  >
                    {accent}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pl-[8px] py-[2px] h-[32px] rounded-[12px] cursor-default hover:bg-white/5 group text-sm">
          Typeface
          <Select
            defaultValue={theme?.typography}
            onValueChange={handleTypographyChange}
          >
            <SelectTrigger className="w-[100px] border-none" size="sm">
              <SelectValue placeholder="Select a typeface" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-200 border-border/20">
              <SelectGroup>
                <SelectLabel>Typeface</SelectLabel>
                <SelectItem
                  value="sans"
                  className="capitalize focus:bg-white/5 focus:text-zinc-200"
                >
                  Sans
                </SelectItem>
                <SelectItem
                  value="mono"
                  className="capitalize focus:bg-white/5 focus:text-zinc-200"
                >
                  Mono
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pl-[8px] py-[2px] h-[32px] rounded-[12px] cursor-default hover:bg-white/5 group text-sm">
          Mode
          <Select defaultValue={nextTheme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[100px] border-none" size="sm">
              <SelectValue placeholder="Select a typeface" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-zinc-200 border-border/20">
              <SelectGroup>
                <SelectLabel>Mode</SelectLabel>
                <SelectItem
                  value="light"
                  className="capitalize focus:bg-white/5 focus:text-zinc-200"
                >
                  Light
                </SelectItem>
                <SelectItem
                  value="dark"
                  className="capitalize focus:bg-white/5 focus:text-zinc-200"
                >
                  Dark
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
  const theme = useEditorStore((s) => s.data.theme);
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
        "w-[100px] h-full text-zinc-200 rounded-[12px] active:opacity-80 flex items-center justify-center px-[12px] transition-colors duration-100",
        (isSyncing || isPublishing) && "cursor-wait text-zinc-200/50"
      )}
      style={{
        boxShadow: "0px 1px 2px 0px rgba(255, 255, 255, 0.6) inset",
        backgroundColor: THEME_MAPPING.accent[theme?.accent || "blue"],
      }}
      onClick={handleClick}
      disabled={isSyncing || isPublishing}
    >
      {isSyncing ? (
        <div className="flex items-center gap-1">
          <LoaderIcon className="animate-spin" size={16} />
          Saving
        </div>
      ) : isPublishing ? (
        <div className="flex items-center gap-2">Publishing</div>
      ) : isUptoDate ? (
        "Copy URL"
      ) : (
        "Publish"
      )}
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
    <div className="w-full fixed bottom-0 left-0 z-50 pb-[24px] pointer-events-none">
      <div className="h-[44px] w-fit rounded-[16px] p-[4px] border border-border/20 flex items-center gap-[12px] bg-zinc-900/80 backdrop-blur-xs shadow-sm pointer-events-auto mx-auto">
        <PageDropdown />
        <ThemeDropdown />
        <div className="w-px h-full bg-white/5" />
        <PublishButton siteId={siteId} subdomain={subdomain} />
      </div>
    </div>
  );
};

export default Toolbar;
