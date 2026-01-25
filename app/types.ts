export type BlockProps = {
  index: number;
};

export type Block = TextBlock | SectionBlock | ImageBlock | BlockquoteBlock;

export type TextBlock = {
  uuid: string;
  type: "text";
  props: {
    content: string;
  };
};

export type SectionBlock = {
  uuid: string;
  type: "section";
  props: {
    title: string;
  };
};

export type ImageBlock = {
  uuid: string;
  type: "image";
  props: {
    url: string;
  };
};

export type BlockquoteBlock = {
  uuid: string;
  type: "blockquote";
  props: {
    content: string;
  };
};
