"use client";
import { useEditorStore } from "@/store/editor-store";
import { useEffect, useMemo } from "react";
import { SectionProps } from "@/components/editor/blocks/section";
import { useState } from "react";
import { slugify } from "@/lib/utils";

const TOC = () => {
  const pages = useEditorStore((s) => s.data.pages);
  const pageIndex = useEditorStore((s) => s.pageIndex);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // get all section ids
  const sectionIds = useMemo(() => {
    return (
      pages[pageIndex]?.blocks
        .filter((b) => b.type === "section")
        .map((s) => slugify(s.props.title)) ?? []
    );
  }, [pages, pageIndex]);

  // observe section intersections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  if (sectionIds.length <= 1) return <div></div>;

  return (
    <div
      className="max-w-[256px] w-full h-full fixed pt-[128] pl-[64] top-0 left-0"
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {isCollapsed ? (
        <div key="collapsed" className="flex flex-col gap-3 z-10">
          {pages[pageIndex].blocks.map((block, idx) => {
            if (block.type !== "section") return null;

            const props = block.props as SectionProps;
            const isActive = activeId === slugify(props.title);
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
                onClick={(e) => {
                  e.preventDefault();
                  const id = slugify(title);
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center",
                    });
                    // Update the URL hash without reloading
                    if (history.pushState) {
                      history.pushState(null, "", `#${id}`);
                    } else {
                      window.location.hash = `#${id}`;
                    }
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

export default TOC;
