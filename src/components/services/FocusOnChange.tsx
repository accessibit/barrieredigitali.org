"use client";

import { useEffect, useRef } from "react";

/**
 * Quando `value` cambia (non al primo render) porta il focus sull'elemento
 * `targetId` e lo fa scorrere in vista. Usato per il cambio di pagina.
 */
export function FocusOnChange({
  value,
  targetId,
}: {
  value: string;
  targetId: string;
}) {
  const previous = useRef(value);
  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    const target = document.getElementById(targetId);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  }, [value, targetId]);
  return null;
}
