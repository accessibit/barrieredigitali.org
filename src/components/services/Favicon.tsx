import { faviconColor } from "@/lib/site";

/** Iniziale colorata al posto del favicon del servizio (decorativa). */
export function Favicon({
  name,
  slug,
  size = "md",
}: {
  name: string;
  slug: string;
  size?: "md" | "lg";
}) {
  const sizes =
    size === "lg"
      ? "size-14 rounded-xl text-2xl narrow:size-12 narrow:text-lg"
      : "size-9 rounded-lg text-base narrow:size-8 narrow:text-[0.9375rem]";
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center font-bold text-white ${sizes}`}
      style={{ backgroundColor: faviconColor(slug) }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
