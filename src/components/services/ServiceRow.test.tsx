import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pager } from "@/components/services/Pager";
import { ServiceRow } from "@/components/services/ServiceRow";
import { expectNoAxeViolations } from "@/test/a11y/axe";

const service = {
  id: "1",
  slug: "negozio-example",
  name: "negozio.example",
  kind: "WEBSITE" as const,
  count: 47,
  lastReportAt: new Date("2026-10-02T12:00:00Z"),
};

describe("ServiceRow", () => {
  it("espone un solo link con il nome del servizio ed è accessibile", async () => {
    const { container } = render(
      <ul>
        <ServiceRow service={service} rank={1} />
      </ul>,
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "negozio.example" }),
    ).toHaveAttribute("href", "/segnalazioni/negozio-example");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "1. negozio.example Sito web",
    );
    expect(screen.getByText("2 ott 2026")).toHaveAttribute(
      "datetime",
      "2026-10-02",
    );
    await expectNoAxeViolations(container);
  });
});

describe("Pager", () => {
  it("indica la pagina attuale e nasconde i salti", async () => {
    const { container } = render(
      <Pager
        page={9}
        pages={17}
        total={423}
        start={200}
        perPage={25}
        query=""
        sort="count"
      />,
    );
    const nav = screen.getByRole("navigation", {
      name: "Pagine dei risultati",
    });
    expect(nav).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Pagina 9, pagina attuale" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "← Precedente" })).toHaveAttribute(
      "href",
      "/?pagina=8",
    );
    expect(
      screen.getByText("Risultati 201–225 di 423 · pagina 9 di 17"),
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
