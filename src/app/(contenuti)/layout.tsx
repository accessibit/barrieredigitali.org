export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wrap">
      <article className="page prose-bd">{children}</article>
    </div>
  );
}
