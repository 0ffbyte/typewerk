import type { SiteObject } from "@/app/types";
import sanitize from "sanitize-html";
import { produce } from "immer";
import { BlockRegistry } from "./block-registry";

/**
 * Sanitizes HTML content in text blocks to prevent XSS attacks
 * while allowing basic formatting tags (b, u, i)
 */

export const SANITIZE_CONFIG: sanitize.IOptions = {
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedTags: ["br", "p", "span"],
};

export function sanitizeSiteObject(siteObject: SiteObject): SiteObject {
  return produce(siteObject, (draft) => {
    draft.pages.forEach((page) => {
      page.blocks.forEach((block) => {
        if (BlockRegistry[block.type].sanitize) {
          block.props.content = sanitize(block.props.content, SANITIZE_CONFIG);
        }
      });
    });
  });
}
