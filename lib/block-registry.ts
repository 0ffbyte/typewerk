import Section, { type SectionProps } from "@/components/editor/blocks/section";
import Image, { type ImageProps } from "@/components/editor/blocks/image";
import Text, { type TextProps } from "@/components/editor/blocks/text";
import Blockquote, {
  type BlockquoteProps,
} from "@/components/editor/blocks/blockquote";
import Checkmate, {
  type CheckmateProps,
} from "@/components/editor/blocks/chekmate";
import AlertumBlock, {
  type AlertumProps,
} from "@/components/editor/blocks/alertum";

import R_Text from "@/components/renderer/text";
import R_Section from "@/components/renderer/section";
import R_Image from "@/components/renderer/image";

import {
  AlertTriangleIcon,
  ChessKnightIcon,
  Heading1Icon,
  ImageIcon,
  QuoteIcon,
  TextIcon,
  type LucideIcon,
} from "lucide-react";

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
      title: "",
    },
    sanitize: true,
    displayName: "Section",
    icon: Heading1Icon,
  } as BlockDefinition<SectionProps>,
  image: {
    component: Image,
    renderedComponent: R_Image,
    defaultProps: {
      url: "https://i.pinimg.com/1200x/57/d9/5e/57d95e17aea9169c28ce7a5ca5c85665.jpg",
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
  alertum: {
    component: AlertumBlock,
    renderedComponent: Text,
    defaultProps: {
      content: "",
    },
    sanitize: true,
    displayName: "Alertum",
    icon: AlertTriangleIcon,
  } as BlockDefinition<AlertumProps>,
};

export type BlockType = keyof typeof BlockRegistry;
export type BlockRegistryType = typeof BlockRegistry;
