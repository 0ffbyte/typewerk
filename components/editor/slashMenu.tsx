"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  TextIcon,
  ImageIcon,
  SectionIcon,
  SparklesIcon,
  LayoutIcon,
  CodeIcon,
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
          name: "image",
          icon: ImageIcon,
          shortcuts: ["alt+i"],
          action: () => addBlock("image", selectedIndex + 1),
        },
      ],
    },
    {
      label: "Basic Blocks",
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
          name: "image",
          icon: ImageIcon,
          shortcuts: ["alt+i"],
          action: () => addBlock("image", selectedIndex + 1),
        },
        {
          name: "code",
          icon: CodeIcon,
          shortcuts: ["alt+c"],
          action: () => addBlock("code", selectedIndex + 1),
        },
      ],
    },
  ];

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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slashMenu, flatItems, activeIndex, closeMenu]);

  if (!slashMenu) return null;

  // Track cumulative index across groups for keyboard highlight mapping
  let groupOffset = 0;

  return (
    <motion.div
      className="absolute flex flex-col p-[4px] w-[212px] max-h-[248px] overflow-y-auto rounded-lg shadow-2xl bg-zinc-900/80 text-zinc-200 backdrop-blur-xs z-40 select-none"
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
        damping: 24,
        stiffness: 360,
        opacity: { duration: 0.1 },
      }}
    >
      <AnimatePresence mode="wait">
        {isSearching ? (
          // ── Flat filtered results ──────────────────────────────────────
          <motion.div
            key="search"
            className="w-full"
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.12 }}
          >
            {flatItems.length > 0 ? (
              flatItems.map((item, idx) => (
                <MenuItem
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
                <div key={group.label} className="mb-1 last:mb-0">
                  {/* Group header */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5">
                    <span className="text-[11px] font-medium tracking-wide uppercase text-zinc-500">
                      {group.label}
                    </span>
                  </div>

                  {/* Group items */}
                  {group.items.map((item, idx) => (
                    <MenuItem
                      key={item.name + idx}
                      item={item}
                      isActive={activeIndex === groupStart + idx}
                      onMouseEnter={() => setActiveIndex(groupStart + idx)}
                      onClick={() => {
                        item.action();
                        closeMenu();
                      }}
                    />
                  ))}

                  {/* Divider between groups */}
                  {!isLast && (
                    <div className="w-full my-1 border-t border-zinc-500" />
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
  item: Command;
  isActive: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
};

const MenuItem = ({ item, isActive, onMouseEnter, onClick }: MenuItemProps) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    className={`flex items-center gap-1 w-full p-[8px] rounded-[12px] cursor-pointer transition-colors duration-100 ${
      isActive ? "bg-zinc-700/80" : "hover:bg-zinc-800/60"
    }`}
  >
    <div className="h-full aspect-square">
      <item.icon className="text-zinc-300" size={16} />
    </div>
    <span className="capitalize text-xs text-zinc-200">{item.name}</span>
    {item.shortcuts[0] && (
      <span className="ml-auto text-xs text-zinc-500">{item.shortcuts[0]}</span>
    )}
  </div>
);

export default SlashMenu;
