import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// @testing-library/react's built-in auto-cleanup relies on a global
// `afterEach`, which isn't injected since this project runs Vitest with
// `globals: false`. Register it explicitly instead.
afterEach(() => {
  cleanup();
});
