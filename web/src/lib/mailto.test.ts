import { describe, expect, it } from "vitest";
import { buildMailtoUrl } from "./mailto";

describe("buildMailtoUrl", () => {
  it("builds a mailto: URL with URL-encoded subject and body", () => {
    const url = buildMailtoUrl("them@example.com", {
      subject: "A shopping list was shared with you",
      body: "- Milk: 2 L\n- Bread: 1 PACK",
    });

    expect(url).toBe(
      "mailto:them@example.com?subject=A+shopping+list+was+shared+with+you&body=-+Milk%3A+2+L%0A-+Bread%3A+1+PACK",
    );
  });

  it("works with an empty recipient email", () => {
    const url = buildMailtoUrl("", { subject: "s", body: "b" });
    expect(url).toBe("mailto:?subject=s&body=b");
  });
});
