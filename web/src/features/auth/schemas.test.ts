import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid phone number and non-empty password", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "+15551234567",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a phone number without a leading plus", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "15551234567",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a phone number starting with 0", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "+05551234567",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short phone number", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "+1234",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      phoneNumber: "+15551234567",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      phoneNumber: "+15551234567",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = registerSchema.safeParse({
      name: "",
      phoneNumber: "+15551234567",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      phoneNumber: "+15551234567",
      password: "short1",
    });
    expect(result.success).toBe(false);
  });
});
