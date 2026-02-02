import { SiteObject } from "@/app/types";

export default function Header({
  image,
  heading,
  subheading,
}: SiteObject["header"]) {
  return (
    <div className="flex flex-col mb-[68px] gap-[16px]">
      <img
        width={64}
        height={64}
        className="object-cover rounded-[20px] w-[64px] h-[64px] hidden"
        src={image ?? ""}
      />

      <div>
        <h1 className="font-semibold text-[28px] leading-[32px]">{heading}</h1>
        <h2 className="text-zinc-500 font-semibold text-[28px] leading-[32px]">
          {subheading}
        </h2>
      </div>
    </div>
  );
}
