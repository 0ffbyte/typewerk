"use client";
import { useEditorStore } from "@/store/editor-store";
import { useMemo, useRef } from "react";
import { SectionProps } from "@/components/editor/blocks/section";
import { useState } from "react";
import { useActiveSection } from "@/hooks/use-active-section";

const PageIndex = () => {
  const pages = useEditorStore((s) => s.data.pages);
  const pageIndex = useEditorStore((s) => s.pageIndex);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const sectionIds = useMemo(() => {
    return (
      pages[pageIndex]?.blocks
        .filter((b) => b.type === "section")
        .map((s) => s.props.title.toLowerCase().replace(/\s+/g, "-")) ?? []
    );
  }, [pages, pageIndex]);

  const activeSection = useActiveSection(sectionIds);
  if (sectionIds.length <= 1) return <div></div>;

  return (
    <div
      className="max-w-[200px] w-full pb-[92] fixed top-[128] left-[64]"
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setTimeout(() => setIsCollapsed(true), 1000)}
    >
      {isCollapsed ? (
        <div key="collapsed" className="flex flex-col gap-3 z-10">
          {pages[pageIndex].blocks.map((block, idx) => {
            if (block.type !== "section") return null;

            const props = block.props as SectionProps;
            const isActive =
              activeSection === props.title.toLowerCase().replace(/\s+/g, "-");
            return (
              <div
                key={block.id}
                className="bg-border rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isActive ? "var(--color-foreground)" : "",
                  height: "4px",
                  width: isActive ? "36px" : "24px",
                }}
                title={props.title}
              />
            );
          })}
        </div>
      ) : (
        <div key="expanded" className="flex flex-col gap-2">
          <p className="text-muted-foreground">Page index</p>
          {pages[pageIndex].blocks.map((block) => {
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
                      block: "center",
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
