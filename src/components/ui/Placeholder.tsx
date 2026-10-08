/** Shows the value, or a highlighted placeholder until the data is defined. */
export function Placeholder({
  value,
  label,
}: {
  value: string | null;
  label: string;
}) {
  if (value) return <>{value}</>;
  return <span className="placeholder-mark">[{label}]</span>;
}

export function EmailOrPlaceholder({
  value,
  label,
}: {
  value: string | null;
  label: string;
}) {
  if (value) return <a href={`mailto:${value}`}>{value}</a>;
  return <Placeholder value={null} label={label} />;
}
