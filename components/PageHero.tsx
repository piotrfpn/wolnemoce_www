type PageHeroProps = {
  label: string;
  title: string;
  description: string;
  icon?: string;
  actions?: React.ReactNode;
};

export default function PageHero({
  label,
  title,
  description,
  icon = "fas fa-industry",
  actions,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0d3d26] via-[#1a5f3c] to-[#2d8a5e] px-6 pb-20 pt-36 text-white">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_50%,white_2px,transparent_2px),radial-gradient(circle_at_80%_20%,white_1px,transparent_1px),radial-gradient(circle_at_40%_80%,white_1.5px,transparent_1.5px)] [background-size:60px_60px,40px_40px,80px_80px]" />

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur">
          <i className={`${icon} text-[#fbbf24]`}></i>
          {label}
        </div>

        <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-1px] md:text-5xl lg:text-[56px]">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
          {description}
        </p>

        {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
      </div>
    </section>
  );
}
