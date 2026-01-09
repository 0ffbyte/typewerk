import { SiteObject } from "@/store/editor-store";

export default function Header({
  image,
  heading,
  subheading,
}: SiteObject["header"]) {
  return (
    <div className="flex flex-col mb-[68px] gap-[16px]">
      {true && (
        <img
          width={64}
          height={64}
          className="object-cover rounded-[20px] w-[64px] h-[64px]"
          src={image ?? ""}
        />
      )}
      <div>
        <h1 className="text-[32px] leading-[38px] font-medium">{heading}</h1>
        <h1 className="text-[32px] leading-[38px] font-medium text-zinc-500">
          {subheading}
        </h1>
      </div>
    </div>
  );
}
