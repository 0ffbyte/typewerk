import { SectionBlock } from "@/app/types";

const Section = ({ title }: SectionBlock["props"]) => {
  return <h3 className="font-semibold text-[16px]">{title}</h3>;
};

export default Section;
