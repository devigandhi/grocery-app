export interface EmailPayload {
  subject: string;
  body: string;
}

export function buildMailtoUrl(email: string, payload: EmailPayload): string {
  const params = new URLSearchParams({
    subject: payload.subject,
    body: payload.body,
  });
  return `mailto:${email}?${params.toString()}`;
}
