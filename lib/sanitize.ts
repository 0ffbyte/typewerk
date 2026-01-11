import type { SiteObject } from "@/store/editor-store";
import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes HTML content in text blocks to prevent XSS attacks
 * while allowing basic formatting tags (b, u, i)
 */
export function sanitizeSiteObject(siteObject: SiteObject): SiteObject {
  console.log("sanitizing site object...");
  return {
    ...siteObject,
    blocks: siteObject.blocks.map((block) => {
      if (block.type === "text" && block.props?.content) {
        return {
          ...block,
          props: {
            ...block.props,
            content: sanitizeHtml(block.props.content, {
              allowedTags: ["b", "u", "i", "strong", "em", "br", "a", "p"],
            }),
          },
        };
      }
      return block;
    }),
  };
}
