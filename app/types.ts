import { BlockRegistry } from "@/lib/block-registry";

export type BlockProps = {
  index: number;
  id: string;
};

export type BaseBlock = {
  id: string;
  type: keyof typeof BlockRegistry;
  props: Record<string, any>;
};

export type Page = {
  id: string;
  name: string;
  blocks: BaseBlock[];
};

export const ACCENT_COLORS = ["blue", "pink"] as const;

export type Accent = (typeof ACCENT_COLORS)[number];

export type Theme = {
  accent: Accent;
  typography: "sans" | "mono";
};

export type SiteObject = {
  header: {
    image: string;
    heading: string;
    subheading: string;
  };
  theme: Theme;
  pages: Page[];
};
