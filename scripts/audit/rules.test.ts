import { describe, expect, it } from "vitest";

import { RULE_TEXT } from "./rules";

describe("RULE_TEXT", () => {
  for (const [rule, { text, wcag }] of Object.entries(RULE_TEXT)) {
    it(`${rule}: well-formed Italian text, singular and plural`, () => {
      expect(wcag.length).toBeGreaterThan(0);
      for (const n of [1, 3]) {
        const out = text("nella home page", n);
        expect(out).toMatch(/^Nella home page[ ,]/);
        expect(out).toMatch(/\.$/);
        expect(out).not.toMatch(/undefined|NaN|\$\{|  /);
        if (n === 1) expect(out).not.toMatch(/\b1 /);
      }
    });
  }

  it("uses the count in the plural", () => {
    expect(RULE_TEXT["image-alt"]!.text("nella home page", 4)).toContain(
      "4 immagini",
    );
    expect(RULE_TEXT["image-alt"]!.text("nella home page", 1)).toContain(
      "un’immagine",
    );
  });
});
