import { ImageProps } from "../editor/blocks/image";

const Image = ({ images }: ImageProps) => {
  return (
    <div className="w-full aspect-video relative overflow-hidden outline-none"></div>
  );
};

export default Image;
