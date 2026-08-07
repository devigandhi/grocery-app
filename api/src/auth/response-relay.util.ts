import type { Response as ExpressResponse } from 'express';

/** Relays a Better Auth `asResponse: true` Fetch Response onto the Express response, cookies included. */
export async function relayFetchResponse(
  res: ExpressResponse,
  fetchRes: Response,
): Promise<void> {
  fetchRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    res.setHeader(key, value);
  });
  for (const cookie of fetchRes.headers.getSetCookie?.() ?? []) {
    res.append('Set-Cookie', cookie);
  }
  const body = await fetchRes.text();
  res.status(fetchRes.status).send(body);
}
