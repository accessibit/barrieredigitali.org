/** Mostra il valore, oppure un segnaposto evidenziato finché il dato non è definito. */
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
