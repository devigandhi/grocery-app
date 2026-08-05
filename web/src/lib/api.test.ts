import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { normalizeApiError } from "./api";

function makeAxiosError(overrides: Partial<AxiosError>): AxiosError {
  return {
    isAxiosError: true,
    name: "AxiosError",
    message: "Network Error",
    toJSON: () => ({}),
    ...overrides,
  } as AxiosError;
}

describe("normalizeApiError", () => {
  it("passes through the NestJS error shape when present", () => {
    const err = makeAxiosError({
      response: {
        data: { statusCode: 409, message: "Phone number already in use", error: "Conflict" },
        status: 409,
        statusText: "Conflict",
        headers: {},
        config: {} as never,
      },
    });

    expect(normalizeApiError(err)).toEqual({
      statusCode: 409,
      message: "Phone number already in use",
      error: "Conflict",
    });
  });

  it("falls back to the axios error message when there is no response body", () => {
    const err = makeAxiosError({ message: "Network Error" });

    expect(normalizeApiError(err)).toEqual({ message: "Network Error" });
  });
});
