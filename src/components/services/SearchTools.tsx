"use client";

import type { Route } from "next";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { listHref, SORT_PARAM } from "@/lib/search-params";
import type { SortOrder } from "@/lib/services";

const segButton =
  "min-h-12 flex-auto cursor-pointer border-0 bg-white px-4 py-2 text-[0.9375rem] font-medium whitespace-nowrap text-ink hover:bg-paper aria-pressed:bg-ink aria-pressed:font-bold aria-pressed:text-white narrow:basis-1/2 narrow:p-2 narrow:whitespace-normal";

/**
 * Search and sorting. Also works without JavaScript (GET form);
 * with JavaScript the results update while typing.
 */
export function SearchTools({
  query,
  sort,
}: {
  query: string;
  sort: SortOrder;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | undefined>(undefined);

  // Syncs the field if the search changes from outside (e.g. "Mostra tutte le segnalazioni").
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    // Do not overwrite what is being typed (e.g. the trailing space is not in the URL).
    if (query !== value.trim()) setValue(query);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function navigate(nextQuery: string, nextSort: SortOrder) {
    router.replace(listHref({ query: nextQuery, sort: nextSort }) as Route, {
      scroll: false,
    });
  }

  function onChange(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => navigate(next, sort), 300);
  }

  function clear(event: React.MouseEvent) {
    event.preventDefault();
    window.clearTimeout(timer.current);
    setValue("");
    navigate("", sort);
    inputRef.current?.focus();
  }

  function pickSort(event: React.MouseEvent, next: SortOrder) {
    event.preventDefault();
    window.clearTimeout(timer.current);
    navigate(value, next);
  }

  return (
    <Form
      action="/"
      replace
      scroll={false}
      onSubmit={() => window.clearTimeout(timer.current)}
      className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4 pb-5 narrow:gap-3.5 narrow:pt-3 narrow:pb-4"
    >
      {/* Default button for submitting with Enter: keeps the current sort order. */}
      <button
        type="submit"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        Cerca
      </button>
      <input type="hidden" name="ordina" value={SORT_PARAM[sort]} />
      <div role="search" className="min-w-0 flex-[1_1_22rem] narrow:basis-full">
        <label className="label" htmlFor="ricerca">
          Cerca tra le segnalazioni
        </label>
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            id="ricerca"
            name="q"
            type="search"
            className="input pr-12 [&::-webkit-search-cancel-button]:appearance-none"
            placeholder="Cerca un sito, un'app o un servizio…"
            autoComplete="off"
            enterKeyHint="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {value.length > 0 && (
            <Link
              href={listHref({ sort }) as Route}
              replace
              scroll={false}
              aria-label="Cancella la ricerca"
              onClick={clear}
              className="absolute right-0.5 inline-flex size-11 cursor-pointer items-center justify-center rounded text-ink hover:bg-paper hover:text-ink"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </Link>
          )}
        </div>
      </div>
      <fieldset className="m-0 min-w-0 border-0 p-0 narrow:basis-full">
        <legend className="mb-1.5 p-0 text-[0.9375rem] font-semibold">
          Ordina per
        </legend>
        <div className="seg flex overflow-hidden rounded-md border border-ink">
          <button
            type="submit"
            name="ordina"
            value={SORT_PARAM.count}
            aria-pressed={sort === "count"}
            onClick={(e) => pickSort(e, "count")}
            className={segButton}
          >
            Più segnalati
          </button>
          <button
            type="submit"
            name="ordina"
            value={SORT_PARAM.recent}
            aria-pressed={sort === "recent"}
            onClick={(e) => pickSort(e, "recent")}
            className={`${segButton} border-l border-ink`}
          >
            Più recenti
          </button>
        </div>
      </fieldset>
    </Form>
  );
}
