export type BlockProps = {
  index: number;
};

export type Block = TextBlock | SectionBlock | ImageBlock;

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
