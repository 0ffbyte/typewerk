import { BlockRegistry } from "@/lib/block-registry";
import { THEME_MAPPING } from "@/lib/utils";

export type BlockProps = {
  index: number;
  id: string;
};

export type Block = {
  id: string;
  type: keyof typeof BlockRegistry;
  props: Record<string, any>;
};

export type Page = {
  id: string;
  name: string;
  blocks: Block[];
};

export type Header = {
  image: string;
  heading: string;
  subheading: string;
};

export type Accent = keyof typeof THEME_MAPPING.accent;

export type Theme = {
  accent: Accent;
  typography: "sans" | "mono";
};

export type SiteObject = {
  header: Header;
  pages: Page[];
  theme: Theme;
};

export type UserSite = {
  id: string;
  header: Header;
  subdomain: string;
  pageCount: number;
  createdAt: string;
  status: "draft" | "published" | "archived";
};
