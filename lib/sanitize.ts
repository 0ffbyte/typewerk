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
    a: ["href", "target", "rel"],
    span: ["id"],
  },
  allowedTags: [
    "br",
    "div",
    "p",
    "span",
    "i",
    "em",
    "u",
    "mark",
    "a",
    "b",
    "strong",
  ],
  exclusiveFilter: (frame) => {
    if (frame.tag === "span") return false; // causes sanitize-html to drop the tag and promote its children
    return false;
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
