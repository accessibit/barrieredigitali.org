import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ErrorSummary } from "@/components/report/ErrorSummary";
import { Field } from "@/components/report/Field";
import { expectNoAxeViolations } from "@/test/a11y/axe";

describe("ErrorSummary + Field", () => {
  it("collega riepilogo, messaggi e campi, ed è accessibile", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <ErrorSummary errors={{ site: "scrivi il nome." }} />
        <Field
          id="segnala-sito"
          label="Nome o indirizzo"
          required
          hint="Ad esempio negozio.example"
          error="scrivi il nome."
        >
          {(describedBy, invalid) => (
            <input
              id="segnala-sito"
              aria-invalid={invalid}
              aria-describedby={describedBy}
            />
          )}
        </Field>
      </>,
    );

    expect(screen.getByRole("alert")).toHaveAccessibleName(
      "Correggi 1 campo per inviare",
    );
    const input = screen.getByRole("textbox", { name: /Nome o indirizzo/ });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription(
      "Errore: scrivi il nome. Ad esempio negozio.example",
    );

    await user.click(
      screen.getByRole("link", { name: "Nome o indirizzo: scrivi il nome." }),
    );
    expect(input).toHaveFocus();

    await expectNoAxeViolations(container);
  });

  it("non mostra nulla senza errori", () => {
    const { container } = render(<ErrorSummary errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
