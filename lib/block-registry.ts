import Section from "@/components/editor/section";
import Image from "@/components/editor/image";
import Text from "../components/editor/text";
import RenderText from "@/components/renderer/text";
import type { TextBlock, SectionBlock, ImageBlock } from "@/app/types";

export type BlockDefinition = {
  component: React.FC<any>;
  renderedComponent: React.FC<any>;
  displayName: string;
  defaultProps: any;
};

export const BlockRegistry: Record<string, BlockDefinition> = {
  text: {
    component: Text,
    renderedComponent: RenderText,
    displayName: "Text",
    defaultProps: {
      content: "",
    } as TextBlock["props"],
  },
  section: {
    component: Section,
    renderedComponent: Section,
    displayName: "Section",
    defaultProps: {
      title: "",
    } as SectionBlock["props"],
  },
  image: {
    component: Image,
    renderedComponent: Image,
    displayName: "Image",
    defaultProps: {
      url: "https://i.pinimg.com/originals/12/9b/5d/129b5d93ed185765b112be03e9f617d1.gif",
    } as ImageBlock["props"],
  },
};

export type BlockType = keyof typeof BlockRegistry;
export type BlockRegistryType = typeof BlockRegistry;
