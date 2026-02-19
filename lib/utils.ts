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
