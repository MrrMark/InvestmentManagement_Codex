type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-amber-700">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-stone-900">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}
