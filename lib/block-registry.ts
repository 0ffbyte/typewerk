import Section from "@/components/editor/section";
import Image from "@/components/editor/image";
import Text from "../components/editor/text";
import R_Text from "@/components/renderer/text";
import R_Section from "@/components/renderer/section";
import R_Image from "@/components/renderer/image";
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
      url: "https://i.pinimg.com/originals/12/9b/5d/129b5d93ed185765b112be03e9f617d1.gif",
    } as ImageBlock["props"],
  },
};

export type BlockType = keyof typeof BlockRegistry;
export type BlockRegistryType = typeof BlockRegistry;
