"use client";

import type { BlockProps } from "@/app/types";
import { useEditorStore } from "@/store/editor-store";
import ContentEditable from "../contenteditable";
import { useRef, useState } from "react";
import useFocused from "@/hooks/use-focused";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  LightbulbIcon,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CalloutTypes = "tip" | "warning" | "error" | "success";

// define block props
export type CalloutProps = {
  content: string;
  type: CalloutTypes;
};

const typeMapping: Record<
  CalloutTypes,
  { background: string; text: string; border: string; icon: LucideIcon }
> = {
  tip: {
    background: "bg-sky-100",
    text: "text-sky-800",
    border: "border-sky-200",
    icon: LightbulbIcon,
  },
  success: {
    background: "bg-teal-100",
    text: "text-teal-800",
    border: "border-teal-200",
    icon: CheckCircleIcon,
  },
  warning: {
    background: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-200",
    icon: AlertCircleIcon,
  },
  error: {
    background: "bg-rose-100",
    text: "text-rose-800",
    border: "border-rose-200",
    icon: AlertTriangleIcon,
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
      if (block.type === "callout") {
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
        "w-full rounded-lg border flex gap-2 group p-2",
        typeMapping[type].border,
        typeMapping[type].text,
        typeMapping[type].background
      )}
      onKeyDown={handleKeyDown}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className="h-full flex items-center justify-center min-h-[24px] p-2 rounded-sm hover:bg-zinc-900/5 transition-colors duration-200 outline-none"
          title={type}
        >
          {React.createElement(typeMapping[type].icon)}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-md bg-zinc-900/80 backdrop-blur-xs shadow-sm text-zinc-200 border-border/10">
          {Object.keys(typeMapping).map((type) => (
            <DropdownMenuItem key={type} onClick={() => handleTypeChange(type)}>
              <span className="flex gap-2 items-center">
                {React.createElement(typeMapping[type as CalloutTypes].icon)}
                {type}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <ContentEditable
        id={id}
        className={cn(typeMapping[type].text, "py-2")}
        placeholderClassName={"text-zinc-950/30"}
        placeholder="Type callout here..."
        ref={ref}
        value={content}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default CalloutBlock;
