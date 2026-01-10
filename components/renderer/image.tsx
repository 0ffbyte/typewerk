import { ImageBlock } from "@/app/types";

const Image = ({ url }: ImageBlock["props"]) => {
  return (
    <div className="w-full aspect-video relative overflow-hidden outline-none">
      <img className="w-full h-full object-cover rounded-[20px]" src={url} />
    </div>
  );
};

export default Image;
