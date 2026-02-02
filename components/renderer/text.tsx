import { TextProps } from "../editor/blocks/text";

const Text = ({ content }: TextProps) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className="text-[16px] text-zinc-600"
    />
  );
};

export default Text;
