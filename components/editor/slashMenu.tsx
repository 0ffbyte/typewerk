"use client";
import useSlashMenu from "@/hooks/use-slash-menu";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

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
      });
    }
  }, [slashMenu?.selectedCommandIndex]);

  if (!slashMenu) return null;

  return (
    <div
      className="absolute overflow-y-scroll flex flex-col justify-start gap-[4px] items-center p-[4px] w-[164px] h-[200px] rounded-[16px] shadow-2x bg-zinc-950/90 text-zinc-200 backdrop-blur-xs z-10 select-none"
      style={{
        left: slashMenu.x,
        top: slashMenu.y,
        scrollbarColor: "#000077 transparent",
        scrollbarWidth: "none",
      }}
    >
      {commandList.map((cmd, idx) => (
        <button
          ref={(el) => {
            itemRefs.current[idx] = el!;
          }}
          key={cmd.name}
          className={cn(
            "hover:bg-white/10 w-full flex items-center justify-start rounded-[12px] h-[40px] px-[8px] shrink-0",
            slashMenu.selectedCommandIndex === idx && "bg-blue-400"
          )}
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
          <cmd.icon />
          {cmd.name}
        </button>
      ))}
    </div>
  );
};

export default SlashMenu;
