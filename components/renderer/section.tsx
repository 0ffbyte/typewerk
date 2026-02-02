import { SectionProps } from "../editor/blocks/section";

const Section = ({ title }: SectionProps) => {
  return <h3 className="font-semibold text-[16px]">{title}</h3>;
};

export default Section;
