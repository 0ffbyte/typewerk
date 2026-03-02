import type { ChecklistProps } from "@/components/editor/blocks/checklist";
import { CheckSquareIcon, SquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const R_Checklist = ({ items }: ChecklistProps) => {
  if (!items?.length) return null;

  return (
    <ul className="flex flex-col gap-1 list-none m-0 p-0">
      {items.map((item, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-2",
            item.checked && "opacity-70"
          )}
        >
          <span className="shrink-0 mt-0.5 text-muted-foreground" aria-hidden>
            {item.checked ? (
              <CheckSquareIcon className="size-4 text-primary" />
            ) : (
              <SquareIcon className="size-4" />
            )}
          </span>
          <span
            className={cn(
              "text-[15px] text-zinc-600",
              item.checked && "line-through text-muted-foreground"
            )}
            dangerouslySetInnerHTML={{ __html: item.content || "&nbsp;" }}
          />
        </li>
      ))}
    </ul>
  );
};

export default R_Checklist;
