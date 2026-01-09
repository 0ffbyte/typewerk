import { TextBlock } from "@/app/types";

const Text = ({ content }: TextBlock["props"]) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
      className="text-[16px] text-zinc-600"
    />
  );
};

export default Text;
