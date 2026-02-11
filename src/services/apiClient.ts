export function apiBase(): string {
  // same-origin (Express serves frontend) in prod; during dev Vite proxy can be used.
  return "";
}

export function authHeaders(): Record<string, string> {
  const token = import.meta.env.VITE_API_AUTH_TOKEN as string | undefined;
  return token ? { "X-OpenDocs-Token": token } : {};
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} ${text}`);
  }

  return (await resp.json()) as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const resp = await fetch(`${apiBase()}${path}`, {
    headers: {
      ...authHeaders(),
    },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} ${text}`);
  }
  return (await resp.json()) as T;
}

/**
 * OpenClaw Integration Service (Feb 2026)
 * Best practice: NEVER expose OpenClaw tokens to the browser.
 */
export const openClaw = {
  async sendMessage(integrationId: string, payload: { to: string; text: string }) {
    return await postJson("/api/integrations/openclaw/send", { integrationId, ...payload });
  }
};
