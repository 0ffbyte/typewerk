import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string): string => {
  if (!text) return "";
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-") // Replace spaces and underscores with dashes
    .replace(/[^a-z0-9-]+/g, "") // Remove all non-alphanumeric and non-dash
    .replace(/--+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ""); // Trim starting and ending dashes
};

export function unwrapSafe(element: Element): Node[] {
  const parent = element.parentNode;
  if (!parent) return [];

  const moved: Node[] = [];
  const reference = element;

  let child = element.firstChild;

  while (child) {
    const next = child.nextSibling;
    moved.push(child);
    parent.insertBefore(child, reference);
    child = next;
  }

  parent.removeChild(element);

  return moved;
}

export function moveCaretToEnd(el: HTMLDivElement) {
  // Move caret to the end of contentEditable
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);

  const sel = document.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export const getLineCount = (html: string) => {
  if (!html) return 1;

  const normalized = normalizeHtml(html);

  const lines = normalized.split("\n");
  const count =
    lines.filter((line, idx) => !(idx === lines.length - 1 && line === ""))
      .length || 1;

  return count;
};

export const getAttributeFromNode = (
  node: Node | null,
  attribute: string
): string | null => {
  if (!node) return null;
  // Only Element nodes can have attributes
  if (node.nodeType === Node.ELEMENT_NODE) {
    return (node as Element).getAttribute(attribute);
  }
  // For text or other node types, try to get parent element's attribute if possible
  const parent = (node as ChildNode).parentElement;
  if (parent) {
    return parent.getAttribute(attribute);
  }
  return null;
};

export const getFoundTags = (selection: Selection | null): string[] => {
  if (!selection || selection.rangeCount === 0) return [];

  const range = selection.getRangeAt(0);
  const tags = new Set<string>();

  // Walk ancestors of the common container
  let node: Node | null =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode
      : range.commonAncestorContainer;

  while (node && node.nodeType === Node.ELEMENT_NODE) {
    tags.add((node as Element).tagName.toLowerCase());
    node = node.parentNode;
  }

  // Walk all elements that intersect the range (catches inline spans mid-selection)
  const root =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode!
      : range.commonAncestorContainer;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(n) {
      return range.intersectsNode(n)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });

  let current = walker.currentNode as Element;
  while (current) {
    if (current.tagName) tags.add(current.tagName.toLowerCase());
    current = walker.nextNode() as Element;
  }

  return Array.from(tags);
};

export const normalizeHtml = (html: string) => {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6]|pre)>/gi, "\n")
    .replace(/<[^>]+>/g, "");
};

export const navigateToPage = (pageName: string) => {
  const url = new URL(window.location.href);
  if (pageName === "home") url.searchParams.delete("p");
  else {
    url.searchParams.set("p", pageName);
    url.hash = ""; // remove any anchor #sections
  }

  window.history.pushState(null, "", url.toString());
};

export const THEME_MAPPING = {
  accent: {
    blue: "var(--color-blue-500)",
    pink: "var(--color-pink-500)",
    teal: "var(--color-teal-500)",
    yellow: "var(--color-yellow-500)",
    rose: "var(--color-rose-500)",
  },
  typography: {
    sans: "font-sans",
    mono: "font-mono",
  },
};
