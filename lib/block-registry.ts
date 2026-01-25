import Section from "@/components/editor/blocks/section";
import Image from "@/components/editor/blocks/image";
import Text from "../components/editor/blocks/text";
import Blockquote from "../components/editor/blocks/blockquote";
import R_Text from "@/components/renderer/text";
import R_Section from "@/components/renderer/section";
import R_Image from "@/components/renderer/image";
import type {
  TextBlock,
  SectionBlock,
  ImageBlock,
  BlockquoteBlock,
} from "@/app/types";

export type BlockDefinition = {
  component: React.FC<any>;
  renderedComponent: React.FC<any>;
  displayName: string;
  defaultProps: any;
};

export const BlockRegistry: Record<string, BlockDefinition> = {
  text: {
    component: Text,
    renderedComponent: R_Text,
    displayName: "Text",
    defaultProps: {
      content: "",
    } as TextBlock["props"],
  },
  section: {
    component: Section,
    renderedComponent: R_Section,
    displayName: "Section",
    defaultProps: {
      title: "",
    } as SectionBlock["props"],
  },
  image: {
    component: Image,
    renderedComponent: R_Image,
    displayName: "Image",
    defaultProps: {
      url: "https://i.pinimg.com/1200x/57/d9/5e/57d95e17aea9169c28ce7a5ca5c85665.jpg",
    } as ImageBlock["props"],
  },
  blockquote: {
    component: Blockquote,
    renderedComponent: R_Text,
    displayName: "Blockquote",
    defaultProps: {
      content: "I'm a man of furtune, and I must seek my fortune.",
    } as BlockquoteBlock["props"],
  },
};

export type BlockType = keyof typeof BlockRegistry;
export type BlockRegistryType = typeof BlockRegistry;
