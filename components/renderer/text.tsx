import { TextBlock } from "@/app/types";

const Text = ({ content }: TextBlock["props"]) => {
  return <div>{content}</div>;
};

export default Text;
