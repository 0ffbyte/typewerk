import { ImageBlock } from "@/app/types";

const Image = ({ url }: ImageBlock["props"]) => {
  return (
    <div className="w-full h-[420px] relative overflow-hidden outline-none">
      <img className="w-full h-full object-cover rounded-[20px]" src={url} />
    </div>
  );
};

export default Image;
