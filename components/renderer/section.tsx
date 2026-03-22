import { SectionProps } from "../editor/blocks/section";

const Section = ({ content }: SectionProps) => {
  return (
    <h1
      className="font-semibold text-[16px]"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default Section;
