"use client";
import { useEditorStore } from "@/store/editor-store";
import { useEffect, useMemo } from "react";
import { SectionProps } from "@/components/editor/blocks/section";
import { useState } from "react";
import { cn, slugify } from "@/lib/utils";

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
        .map((s) => slugify(s.props.content)) ?? []
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
        rootMargin: "-10% 0px -40% 0px",
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
      className="max-w-[300px] w-full fixed pt-[92px] pl-12 pb-12 top-0 right-0"
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      {isCollapsed ? (
        <div key="collapsed" className="flex flex-col gap-6 z-10">
          {pages[pageIndex].blocks.map((block, idx) => {
            if (block.type !== "section") return null;

            const props = block.props as SectionProps;
            const title = props.content;
            if (!title) return null;
            const isActive = activeId === slugify(title);
            return (
              <div
                key={block.id}
                className="bg-border rounded-full transition-all duration-300"
                style={{
                  backgroundColor: isActive
                    ? "var(--color-muted-foreground)"
                    : "",
                  height: "3px",
                  width: isActive ? "28px" : "20px",
                }}
                title={props.content}
              />
            );
          })}
        </div>
      ) : (
        <div key="expanded" className="flex flex-col gap-2">
          <p className="text-muted-foreground font-sans">On this page</p>
          {pages[pageIndex].blocks.map((block) => {
            if (block.type !== "section") return null;
            const props = block.props as SectionProps;
            const title = props.content;
            if (!title) return null;
            const isActive = activeId === slugify(title);
            return (
              <p
                key={block.id}
                className={cn("font-sans", isActive && "underline")}
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
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TOC;
