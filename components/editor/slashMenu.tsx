"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  TextIcon,
  ImageIcon,
  SectionIcon,
  SparklesIcon,
  LayoutIcon,
  CodeIcon,
  QuoteIcon,
  AlertCircleIcon,
  CheckSquareIcon,
} from "lucide-react";

import { useEditorStore } from "@/store/editor-store";
import useInlineMenu from "@/hooks/use-inline-menu";

type Command = {
  name: string;
  icon: React.ElementType;
  shortcuts: string[];
  action: () => void;
};

type Group = {
  label: string;
  icon: React.ElementType;
  items: Command[];
};

const SlashMenu = ({
  ref,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) => {
  const selectedIndex = useEditorStore((s) => s.selectedIndex);
  const addBlock = useEditorStore((s) => s.addBlock);
  const [activeIndex, setActiveIndex] = useState(0);

  const { menu: slashMenu, closeMenu } = useInlineMenu(ref, "/", {
    width: 212,
    height: 248,
  });

  const groups: Group[] = [
    {
      label: "Suggested",
      icon: SparklesIcon,
      items: [
        {
          name: "text",
          icon: TextIcon,
          shortcuts: ["alt+t"],
          action: () => addBlock("text", selectedIndex + 1),
        },
        {
          name: "section",
          icon: SectionIcon,
          shortcuts: ["alt+s"],
          action: () => addBlock("section", selectedIndex + 1),
        },
        {
          name: "image",
          icon: ImageIcon,
          shortcuts: ["alt+i"],
          action: () => addBlock("image", selectedIndex + 1),
        },
      ],
    },
    {
      label: "Writing",
      icon: LayoutIcon,
      items: [
        {
          name: "text",
          icon: TextIcon,
          shortcuts: ["alt+t"],
          action: () => addBlock("text", selectedIndex + 1),
        },
        {
          name: "section",
          icon: SectionIcon,
          shortcuts: ["alt+s"],
          action: () => addBlock("section", selectedIndex + 1),
        },
        {
          name: "blockquote",
          icon: QuoteIcon,
          shortcuts: [],
          action: () => addBlock("blockquote", selectedIndex + 1),
        },
        {
          name: "callout",
          icon: AlertCircleIcon,
          shortcuts: [],
          action: () => addBlock("callout", selectedIndex + 1),
        },

        {
          name: "code",
          icon: CodeIcon,
          shortcuts: ["alt+c"],
          action: () => addBlock("code", selectedIndex + 1),
        },
        {
          name: "checklist",
          icon: CheckSquareIcon,
          shortcuts: [],
          action: () => addBlock("checklist", selectedIndex + 1),
        },
      ],
    },
    {
      label: "Media",
      icon: ImageIcon,
      items: [
        {
          name: "image",
          icon: ImageIcon,
          shortcuts: ["alt+i"],
          action: () => addBlock("image", selectedIndex + 1),
        },
      ],
    },
  ];

  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!slashMenu) return;
    const el = itemRefs.current[activeIndex];
    const container = menuRef.current;
    if (el && container) {
      container.scrollTo({
        top: el.offsetTop - container.offsetTop - container.clientHeight / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  const isSearching = !!slashMenu?.command;

  // Flat list for keyboard nav — either all grouped items (in order) or filtered
  const flatItems = useMemo(() => {
    if (isSearching) {
      const query = slashMenu.command.toLowerCase();
      // Deduplicate by name when searching across groups
      const seen = new Set<string>();
      return groups.flatMap((g) =>
        g.items.filter((item) => {
          if (seen.has(item.name) || !item.name.toLowerCase().includes(query))
            return false;
          seen.add(item.name);
          return true;
        })
      );
    }
    // Grouped mode: flat list preserving group order (with possible dupes across groups)
    return groups.flatMap((g) => g.items);
  }, [slashMenu?.command]);

  // Reset active index on query change
  useEffect(() => {
    setActiveIndex(0);
  }, [slashMenu?.command]);

  useEffect(() => {
    if (!slashMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === 0 ? flatItems.length - 1 : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        flatItems[activeIndex]?.action();
        closeMenu();
      } else if (e.key === "Escape") {
        closeMenu();
      }
    };

    ref.current?.addEventListener("keydown", handleKeyDown);
    return () => ref.current?.removeEventListener("keydown", handleKeyDown);
  }, [slashMenu, flatItems, activeIndex, closeMenu]);

  if (!slashMenu) return null;

  // Track cumulative index across groups for keyboard highlight mapping
  let groupOffset = 0;

  return (
    <motion.div
      ref={menuRef}
      className="absolute flex flex-col p-[4px] w-[212px] max-h-[248px] overflow-y-auto overscroll-contain rounded-lg shadow-2xl bg-zinc-900/80 text-zinc-200 backdrop-blur-xs z-40 select-none"
      style={{
        left: slashMenu.x,
        top: slashMenu.y,
        scrollbarWidth: "none",
        willChange: "transform",
      }}
      layout="size"
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 200,
        opacity: { duration: 0.1 },
      }}
    >
      <AnimatePresence mode="wait">
        {isSearching ? (
          // ── Flat filtered results ──────────────────────────────────────
          <motion.div
            key={flatItems.length}
            className="w-full"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.12 }}
          >
            {/* Group header */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 space-y-1">
              <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400">
                {"Filtered results"}
              </span>
            </div>

            {flatItems.length > 0 ? (
              flatItems.map((item, idx) => (
                <MenuItem
                  index={idx}
                  ref={itemRefs}
                  key={item.name + idx}
                  item={item}
                  isActive={activeIndex === idx}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    item.action();
                    closeMenu();
                  }}
                />
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-zinc-500">No results</p>
            )}
          </motion.div>
        ) : (
          // ── Grouped view ───────────────────────────────────────────────
          <motion.div
            key="grouped"
            className="w-full"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.12 }}
          >
            {groups.map((group) => {
              const groupStart = groupOffset;
              groupOffset += group.items.length;

              const isLast = groupOffset === flatItems.length;

              return (
                <div key={group.label} className="mb-1 last:mb-0 space-y-1">
                  {/* Group header */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-400">
                      {group.label}
                    </span>
                  </div>

                  {/* Group items */}
                  {group.items.map((item, idx) => (
                    <MenuItem
                      index={groupStart + idx}
                      ref={itemRefs}
                      key={item.name + idx}
                      item={item}
                      isActive={activeIndex === groupStart + idx}
                      onMouseEnter={() => {}}
                      onClick={() => {
                        item.action();
                        closeMenu();
                      }}
                    />
                  ))}

                  {/* Divider between groups */}
                  {!isLast && (
                    <div className="w-full my-1 border-t border-zinc-200/10" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Shared menu item ─────────────────────────────────────────────────────────

type MenuItemProps = {
  index: number;
  item: Command;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  ref: React.RefObject<HTMLDivElement[]>;
};

const MenuItem = ({
  index,
  item,
  isActive,
  onMouseEnter,
  onClick,
  ref,
}: MenuItemProps) => (
  <div
    ref={(el) => {
      if (ref.current && el) {
        ref.current[index] = el;
      }
    }}
    onClick={(e: React.MouseEvent) => {
      e.preventDefault();
      onClick();
    }}
    onMouseEnter={onMouseEnter}
    className={`flex items-center gap-1 w-full p-[8px] rounded-[12px] cursor-pointer transition-colors duration-100 ${
      isActive ? "bg-zinc-200/10" : "hover:bg-zinc-200/10"
    }`}
  >
    <div className="h-full aspect-square">
      <item.icon className="text-zinc-300" size={16} />
    </div>
    <span className="capitalize text-xs text-zinc-200">{item.name}</span>
    {item.shortcuts[0] && (
      <span className="ml-auto text-xs text-zinc-400">{item.shortcuts[0]}</span>
    )}
  </div>
);

export default SlashMenu;
