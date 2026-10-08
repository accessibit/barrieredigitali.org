"use client";

import { useEffect, useRef } from "react";

/**
 * When `value` changes (not on first render), moves focus to the element
 * `targetId` and scrolls it into view. Used when changing page.
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
