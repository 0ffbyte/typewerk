import { SectionProps } from "../editor/blocks/section";

const Section = ({ title }: SectionProps) => {
  return (
    <h1
      className="font-semibold text-[16px]"
      dangerouslySetInnerHTML={{ __html: title }}
    />
  );
};

export default Section;
