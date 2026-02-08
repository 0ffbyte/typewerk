"use client";
import useSlashMenu from "@/hooks/use-slash-menu";

import { cn } from "@/lib/utils";

const SlashMenu = ({
  ref,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
}) => {
  const { slashMenu, closeMenu, commandList } = useSlashMenu(ref);

  if (!slashMenu) return null;

  return (
    <div
      className="absolute flex flex-col gap-3 items-center text-xs px-3 py-4 w-[164px] h-[200px] focus:bg-red-500 rounded-lg shadow-2xl bg-zinc-800/90 text-zinc-100 backdrop-blur-xs z-10 select-none"
      style={{
        left: slashMenu.x,
        top: slashMenu.y,
      }}
    >
      <pre>{slashMenu.command}</pre>
      <div className="flex flex-col gap-3 items-center">
        {commandList.map((cmd, idx) => (
          <button
            key={cmd.name}
            className={cn(
              "hover:text-zinc-200 transition-colors hover:bg-blue-400/50",
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
            {cmd.name} {idx}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlashMenu;
