import type { SiteObject } from "@/app/types";
import sanitize from "sanitize-html";
import { produce } from "immer";
import { BlockRegistry } from "./block-registry";

/**
 * Sanitizes HTML content in text blocks to prevent XSS attacks
 * while allowing basic formatting tags (b, u, i, mark)
 */

export const SANITIZE_CONFIG: sanitize.IOptions = {
  allowedAttributes: {
    a: ["href", "target", "rel", "style"],
    span: ["style"],
    mark: ["className"],
  },
  allowedTags: ["br", "p", "span", "i", "em", "u", "mark", "a", "b", "strong"],
  exclusiveFilter: (frame) => {
    // Remove empty tags (no text content and no meaningful children)
    const isSelfClosing = frame.tag === "br";
    if (isSelfClosing) return false;

    const isEmpty = !frame.text.trim() && frame.tag !== "br";
    return isEmpty;
  },
};

export function sanitizeSiteObject(siteObject: SiteObject): SiteObject {
  return produce(siteObject, (draft) => {
    draft.pages.forEach((page) => {
      page.blocks.forEach((block) => {
        if (BlockRegistry[block.type].sanitize) {
          for (const key in block.props) {
            if (typeof block.props[key] === "string") {
              block.props[key] = sanitize(block.props[key], SANITIZE_CONFIG);
            }
          }
        }
      });
    });
  });
}
