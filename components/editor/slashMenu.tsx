"use client";
import useSlashMenu from "@/hooks/use-slash-menu";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

const SlashMenu = ({
  ref,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) => {
  const { slashMenu, closeMenu, commandList } = useSlashMenu(ref);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!slashMenu) return;

    const el = itemRefs.current[slashMenu.selectedCommandIndex];
    if (el) {
      el.scrollIntoView({
        block: "nearest", // prevents jump to top/bottom
        behavior: "smooth", // optional
        inline: "nearest",
      });
    }
  }, [slashMenu?.selectedCommandIndex]);

  if (!slashMenu) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: "easeInOut" }}
      className="absolute overflow-y-scroll flex flex-col justify-start items-center w-[164px] h-[178px] rounded-[16px] shadow-2x bg-zinc-900/90 text-zinc-200 backdrop-blur-xs z-10 select-none"
      style={{
        left: slashMenu.x,
        top: slashMenu.y,
        scrollbarColor: "#000077 transparent",
        scrollbarWidth: "none",
      }}
    >
      {commandList.length >= 1 ? (
        commandList.map((cmd, idx) => (
          <button
            ref={(el) => {
              itemRefs.current[idx] = el!;
            }}
            key={cmd.name}
            className="w-full p-[4px]"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              commandList[idx]?.action();
              closeMenu();
              if (ref.current && typeof ref.current.innerText === "string") {
                ref.current.innerText = ref.current.innerText.slice(
                  0,
                  -slashMenu.command.length - 1 // remove slash and command from typed input
                );
              }
            }}
          >
            <div
              className={cn(
                "hover:bg-white/10 w-full flex items-center justify-start rounded-[12px] h-[28px] gap-[8px] px-[8px] text-[16px]",
                slashMenu.selectedCommandIndex === idx && "bg-white/10"
              )}
            >
              <cmd.icon size={20} />
              {cmd.name.slice(0, 1).toUpperCase() +
                cmd.name.slice(1).toLowerCase()}
            </div>
          </button>
        ))
      ) : (
        <div className="w-full h-full flex items-center justify-center p-[12px]">
          ESC to close
        </div>
      )}
    </motion.div>
  );
};

export default SlashMenu;
