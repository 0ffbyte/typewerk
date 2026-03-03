import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string): string => {
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

  const normalized = html
    // treat <br> as newline
    .replace(/<br\s*\/?>/gi, "\n")
    // treat common block-closing tags as line breaks
    .replace(/<\/(div|p|li|h[1-6]|pre)>/gi, "\n")
    // strip remaining tags
    .replace(/<[^>]+>/g, "");

  const lines = normalized.split("\n");
  const count =
    lines.filter((line, idx) => !(idx === lines.length - 1 && line === ""))
      .length || 1;

  return count;
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
