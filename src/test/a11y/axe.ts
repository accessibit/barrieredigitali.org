import { type RunOptions, run } from "axe-core";
import { expect } from "vitest";

export const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
];

/** Fails the test if axe finds WCAG 2.2 A/AA violations in the given node. */
export async function expectNoAxeViolations(
  container: Element,
  options?: RunOptions,
) {
  const result = await run(container, {
    runOnly: { type: "tag", values: WCAG_TAGS },
    // jsdom does not compute layout: contrast is checked in the Playwright tests.
    rules: { "color-contrast": { enabled: false } },
    ...options,
  });
  if (result.violations.length > 0) {
    const summary = result.violations
      .map(
        (v) =>
          `• ${v.id} (${v.impact}): ${v.help}\n${v.nodes.map((n) => `    ${n.target.join(" ")}`).join("\n")}`,
      )
      .join("\n");
    expect.fail(`Violazioni di accessibilità:\n${summary}`);
  }
}
