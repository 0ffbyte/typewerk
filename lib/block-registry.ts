import Section, { type SectionProps } from "@/components/editor/blocks/section";
import Image, { type ImageProps } from "@/components/editor/blocks/image";
import Text, { type TextProps } from "@/components/editor/blocks/text";
import Blockquote, {
  type BlockquoteProps,
} from "@/components/editor/blocks/blockquote";
import Checkmate, {
  type CheckmateProps,
} from "@/components/editor/blocks/chekmate";
import Callout, { type CalloutProps } from "@/components/editor/blocks/callout";

import R_Text from "@/components/renderer/text";
import R_Section from "@/components/renderer/section";
import R_Image from "@/components/renderer/image";

import {
  CheckCircle2,
  AlertTriangleIcon,
  ChessKnightIcon,
  CodeIcon,
  Heading1Icon,
  ImageIcon,
  QuoteIcon,
  TextIcon,
  type LucideIcon,
} from "lucide-react";
import CodeBlock, { CodeProps } from "@/components/editor/blocks/code";
import Checklist, {
  type ChecklistProps,
} from "@/components/editor/blocks/checklist";

import R_Checklist from "@/components/renderer/checklist";

export type BlockDefinition<P = Record<string, any>> = {
  component: React.FC<any>;
  renderedComponent: React.FC<any>;
  defaultProps: P;
  sanitize?: boolean;
  displayName: string;
  icon: LucideIcon;
};

export const BlockRegistry = {
  text: {
    component: Text,
    renderedComponent: R_Text,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Text",
    icon: TextIcon,
  } as BlockDefinition<TextProps>,
  section: {
    component: Section,
    renderedComponent: R_Section,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Section",
    icon: Heading1Icon,
  } as BlockDefinition<SectionProps>,
  image: {
    component: Image,
    renderedComponent: R_Image,
    defaultProps: {
      url: "https://i.pinimg.com/1200x/b9/82/0f/b9820f69c29058a09ca984e6bf1876bb.jpg",
      transform: {
        x: 0,
        y: 0,
        zoom: 1,
      },
    },
    displayName: "Image",
    icon: ImageIcon,
  } as BlockDefinition<ImageProps>,
  blockquote: {
    component: Blockquote,
    renderedComponent: R_Text,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Blockquote",
    icon: QuoteIcon,
  } as BlockDefinition<BlockquoteProps>,
  checkmate: {
    component: Checkmate,
    renderedComponent: Text,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Checkmate",
    icon: ChessKnightIcon,
  } as BlockDefinition<CheckmateProps>,
  callout: {
    component: Callout,
    renderedComponent: Text,
    defaultProps: {
      content: "",
      type: "tip",
    },
    sanitize: true,
    displayName: "Callout",
    icon: AlertTriangleIcon,
  } as BlockDefinition<CalloutProps>,
  code: {
    component: CodeBlock,
    renderedComponent: Text,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Code",
    icon: CodeIcon,
  } as BlockDefinition<CodeProps>,
  checklist: {
    component: Checklist,
    renderedComponent: R_Checklist,
    sanitize: true,
    defaultProps: {
      items: [{ id: "checklist-item-1", content: "", checked: false }],
    },
    displayName: "Checklist",
    icon: CheckCircle2,
  } as BlockDefinition<ChecklistProps>,
};

export type BlockType = keyof typeof BlockRegistry;
export type BlockRegistryType = typeof BlockRegistry;
