import { BlockRegistry } from "@/lib/block-registry";
import { THEME_MAPPING } from "@/lib/utils";

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

export type Accent = keyof typeof THEME_MAPPING.accent;

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
