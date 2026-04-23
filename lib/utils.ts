import { useEditorStore } from "@/store/editor-store";
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
  // Get the parent node of the given element
  const parent = element.parentNode;
  // If the element has no parent, return an empty array since we can't unwrap
  if (!parent) return [];

  // Create an array to keep track of the moved child nodes
  const moved: Node[] = [];
  // Reference node to help with insertBefore (inserts before the element itself)
  const reference = element;

  // Start with the first child of the element to be unwrapped
  let child = element.firstChild;

  // Iterate over all child nodes of the element
  while (child) {
    // Save next sibling because we're going to move 'child' out of element
    const next = child.nextSibling;
    // Add the current child to the moved array
    moved.push(child);
    // Insert the child node into the parent node, before the reference element
    parent.insertBefore(child, reference);
    // Move to the next child
    child = next;
  }

  // Remove the original (now empty) element from its parent
  parent.removeChild(element);

  // Return the array of moved child nodes
  return moved;
}

export function deleteCrossEditorSelection(
  selection: Selection,
  activeEditorIds: string[]
) {
  const range = selection.getRangeAt(0);

  document
    .querySelectorAll("[data-class='editor-contenteditable']")
    .forEach((el) => {
      const editorId = el.getAttribute("id") ?? "";
      console.log("editorId", editorId);
      if (
        !activeEditorIds.includes(editorId) ||
        !selection.containsNode(el, true)
      )
        return;

      console.log("deleting content...");

      // Clamp the range to only the portion inside this element
      const elRange = document.createRange();
      elRange.selectNodeContents(el);

      const start =
        range.compareBoundaryPoints(Range.START_TO_START, elRange) > 0
          ? range
          : elRange;

      const end =
        range.compareBoundaryPoints(Range.END_TO_END, elRange) < 0
          ? range
          : elRange;

      const clampedRange = document.createRange();
      clampedRange.setStart(start.startContainer, start.startOffset);
      clampedRange.setEnd(end.endContainer, end.endOffset);

      clampedRange.deleteContents();

      const inputEvent = new Event("input", { bubbles: true });
      el.dispatchEvent(inputEvent);
    });
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

export const getFoundTags = (
  selection: Selection | null,
  { includeCollapsed = false }: { includeCollapsed?: boolean } = {}
): string[] => {
  if (!selection || selection.rangeCount === 0) return [];
  if (!includeCollapsed && selection.isCollapsed) return [];

  const range = selection.getRangeAt(0);
  const tags = new Set<string>();

  // Resolve the effective root element (never a text node)
  const effectiveRoot: Node =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentNode!
      : range.commonAncestorContainer;

  // Phase 1: walk ancestors of the common container upward
  let ancestor: Node | null = effectiveRoot;
  while (ancestor?.nodeType === Node.ELEMENT_NODE) {
    tags.add((ancestor as Element).tagName.toLowerCase());
    ancestor = ancestor.parentNode;
  }

  // Phase 2: walk all elements within the range (catches inline tags mid-selection)
  const walker = document.createTreeWalker(
    effectiveRoot,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (n) =>
        range.intersectsNode(n)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT, // prune non-intersecting subtrees
    }
  );

  let current: Node | null = walker.nextNode(); // skip root itself, already handled
  while (current !== null) {
    tags.add((current as Element).tagName.toLowerCase());
    current = walker.nextNode();
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

/**
 * Randomly selects an SFX and plays it.
 * Assumes that sfx files are located under `/sfx/` and have `.mp3` extension.
 */
export function playRandomSfx() {
  const SFX = [
    //"bass-boost-discord-call",
    "faaaa",
    "fart-with-reverb",
    "qbd-lb-b",
    "stynqw-lrybwk",
    "ttmnyk-ly",
  ];

  const extension = "mp3";

  const randIndex = Math.floor(Math.random() * SFX.length);
  const sfxName = SFX[randIndex];
  // Extend the Window interface to include __currentSfxAudio
  interface WindowWithSfxAudio extends Window {
    __currentSfxAudio?: HTMLAudioElement;
  }
  const win = window as WindowWithSfxAudio;
  if (win.__currentSfxAudio instanceof Audio) {
    win.__currentSfxAudio.pause();
    win.__currentSfxAudio.currentTime = 0;
  }
  win.__currentSfxAudio = new Audio(`/sfx/${sfxName}.${extension}`);
  win.__currentSfxAudio.volume = 0.5;
  win.__currentSfxAudio.play();
}
