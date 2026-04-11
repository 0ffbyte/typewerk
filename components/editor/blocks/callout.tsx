"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable/contenteditable";
import { useRef } from "react";
import useFocused from "@/hooks/editor/use-focus";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LightbulbIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type CalloutTypes = "tip" | "warning" | "error" | "success";

// define block props
export type CalloutProps = {
  content: string;
  type: CalloutTypes;
};

export const CALLOUT_TYPE_MAPPING: Record<
  CalloutTypes,
  { background: string; text: string; border: string; icon: any }
> = {
  tip: {
    background: "bg-sky-200",
    text: "text-sky-700",
    border: "border-sky-300",
    icon: <LightbulbIcon size={20} />,
  },
  success: {
    background: "bg-teal-200",
    text: "text-teal-700",
    border: "border-teal-300",
    icon: <CheckCircleIcon size={20} />,
  },
  warning: {
    background: "bg-yellow-200",
    text: "text-yellow-700",
    border: "border-yellow-300",
    icon: <AlertCircleIcon size={20} />,
  },
  error: {
    background: "bg-rose-200",
    text: "text-rose-700",
    border: "border-rose-300",
    icon: <AlertTriangleIcon size={20} />,
  },
};

// define block component
const CalloutBlock = ({
  content,
  type = "error",
  index,
  id,
}: CalloutProps & BlockProps) => {
  const setState = useEditorStore((state) => state.setState);
  const removeBlock = useEditorStore((state) => state.removeBlock);
  const ref = useRef<HTMLDivElement>(null);
  useFocused(ref, index);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      if (
        ref.current?.textContent?.length === 0 &&
        ref.current?.innerHTML?.length <= 4
      ) {
        e.preventDefault();
        removeBlock(index);
      }
    }
  };

  const handleEdit = (v: string) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block?.type === "callout") {
        block.props.content = v;
      }
    });
  };

  const handleTypeChange = (value: string) => {
    setState((s) => {
      const block = s.data.pages[s.pageIndex].blocks[index];
      if (block && block.type === "callout") {
        block.props.type = value;
      }
    });
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border flex gap-2 group p-2 h-full items-start",
        CALLOUT_TYPE_MAPPING[type].border,
        CALLOUT_TYPE_MAPPING[type].text,
        CALLOUT_TYPE_MAPPING[type].background
      )}
      onKeyDown={handleKeyDown}
    >
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          className="h-full flex items-center justify-center p-2 rounded-sm group-hover:bg-zinc-900/5 transition-colors duration-100 outline-none select-none"
          title={type}
        >
          {CALLOUT_TYPE_MAPPING[type as CalloutTypes].icon}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-md bg-zinc-900/80 backdrop-blur-xs shadow-sm text-zinc-200 border-border/20">
          {Object.keys(CALLOUT_TYPE_MAPPING).map((type) => (
            <DropdownMenuItem key={type} onClick={() => handleTypeChange(type)}>
              <span className="flex gap-2 items-center">
                {CALLOUT_TYPE_MAPPING[type as CalloutTypes].icon}
                {type}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="pt-[3px] w-full">
        <ContentEditable
          blockIndex={index}
          id={id}
          className={cn(CALLOUT_TYPE_MAPPING[type].text)}
          placeholderClassName={cn(`${CALLOUT_TYPE_MAPPING[type].text}/50`)}
          placeholder="Type callout here"
          ref={ref}
          value={content}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
};

export default CalloutBlock;
