import type { BlockProps } from "@/app/types";
import useFocus from "@/hooks/use-focus";

// define block props
export type Props = BlockProps & {
  url: string;
};

// define block component
const ImageBlock = ({ url, index }: Props) => {
  const { ref } = useFocus(index);

  return (
    <div
      ref={ref}
      tabIndex={index}
      className="w-full h-[420px] relative overflow-hidden outline-none"
    >
      <img
        className="w-full h-full object-cover rounded-[20px]"
        src={url ?? ""}
      />
    </div>
  );
};

export default ImageBlock;
