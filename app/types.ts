import { BlockRegistry } from "@/lib/block-registry";
import { UUID } from "crypto";

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

export type Theme = {
  accentColor: string;
  typography: "sans-serif" | "serif";
};

export type SiteObject = {
  header: {
    image: string;
    heading: string;
    subheading: string;
  };
  theme?: Theme;
  pages: Page[];
  hasArticles: boolean;
};
