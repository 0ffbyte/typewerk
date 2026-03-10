type Props = {
  thumbnail?: string;
  title: string;
  subtitle: string;
};

const SiteCard = ({ thumbnail, title, subtitle }: Props) => {
  return (
    <div className="flex flex-col items-start justify-start gap-2 group cursor-pointer">
      <div className="w-full h-[256px] border rounded-lg bg-zinc-200 relative overflow-hidden">
        {thumbnail && (
          <img
            src={thumbnail}
            alt="thumbnail"
            className="w-full h-full object-cover transition-all duration-200 ease-in-out"
          />
        )}
      </div>

      <div className="">
        <p className="text-sm mb-1 group-hover:underline">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export default SiteCard;
