/** Deterministic, never-shown email Better Auth's credential engine is keyed on. */
export function syntheticEmailForPhone(phoneNumber: string): string {
  return `${phoneNumber.replace(/[^\d+]/g, '')}@phone.local`;
}
