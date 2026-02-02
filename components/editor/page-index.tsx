"use client";
import { useEditorStore } from "@/store/editor-store";
import { usePageStore } from "@/store/page-store";
import { SectionProps } from "@/components/editor/blocks/section";
import { useState } from "react";

const PageIndex = () => {
  const state = useEditorStore((state) => state);
  const pageIndex = useEditorStore((state) => state.pageIndex);
  const sectionIndex = usePageStore((s) => s.sectionIndex);
  const hasSections =
    state.data.pages[pageIndex].blocks.filter((b) => b.type === "section")
      .length >= 2;
  const [isCollapsed, setIsCollapsed] = useState(true);

  if (!hasSections) return <div></div>;
  return (
    <div
      className="max-w-[200px] w-full pb-[92] sticky top-0 left-0 pt-[64]"
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setTimeout(() => setIsCollapsed(true), 1000)}
    >
      {isCollapsed ? (
        <div key="collapsed" className="flex flex-col gap-3 z-10">
          {state.data.pages[pageIndex].blocks.map((block, idx) => {
            if (block.type !== "section") return null;

            const props = block.props as SectionProps;
            return (
              <div
                key={block.id}
                className="bg-border rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    idx === sectionIndex ? "var(--color-foreground)" : "",
                  height: "4px",
                  width: idx === sectionIndex ? "36px" : "24px",
                }}
                title={props.title}
              />
            );
          })}
        </div>
      ) : (
        <div key="expanded" className="flex flex-col gap-2">
          <p className="text-muted-foreground">Page index</p>
          {state.data.pages[pageIndex].blocks.map((block) => {
            if (block.type !== "section") return null;
            const props = block.props as SectionProps;
            const title = props.title;
            if (!title) return null;
            return (
              <a
                key={block.id}
                href={`#${title.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => {
                  e.preventDefault();
                  const id = `${title.toLowerCase().replace(/\s+/g, "-")}`;
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                      inline: "nearest",
                    });
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {title}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PageIndex;
