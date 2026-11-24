import { createHmac } from "node:crypto";
import { secrets } from "base44:runtime";

const API_BASE = "https://api.mercadolibre.com";
const AUTH_BASE = "https://auth.mercadolivre.com.br/authorization";
const STATE_TTL_MS = 15 * 60 * 1000;

export const ML_CALLBACK_PATH = "/api/mercadolivre/callback";

export const mlCredentials = () => {
  const clientId = secrets.get("MERCADO_LIVRE_CLIENT_ID");
  const clientSecret = secrets.get("MERCADO_LIVRE_CLIENT_SECRET");
  return clientId && clientSecret ? { clientId, clientSecret } : null;
};

const signState = (payload, secret) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const createState = (secret) => {
  const payload = Buffer.from(JSON.stringify({ ts: Date.now() }), "utf8").toString("base64url");
  return `${payload}.${signState(payload, secret)}`;
};

export const isValidState = (state, secret) => {
  const [payload, signature] = String(state ?? "").split(".");
  if (!payload || !signature) return false;
  if (signState(payload, secret) !== signature) return false;
  try {
    const { ts } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Date.now() - Number(ts) < STATE_TTL_MS;
  } catch {
    return false;
  }
};

export const buildAuthUrl = (creds, redirectUri) =>
  `${AUTH_BASE}?response_type=code&client_id=${encodeURIComponent(creds.clientId)}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(createState(creds.clientSecret))}`;

const requestToken = async (body) => {
  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(body).toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(
      data?.message || data?.error_description || "O Mercado Livre recusou a autorização.",
    );
  }
  return data;
};

export const exchangeCode = (creds, code, redirectUri) =>
  requestToken({
    grant_type: "authorization_code",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    code,
    redirect_uri: redirectUri,
  });

export const mlGet = async (token, path) => {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "O Mercado Livre não respondeu como esperado.");
  }
  return data;
};

export const readConnection = async (db) => {
  const page = await db.entities.MarketplaceConnection.list({ sort: "-created_date", limit: 1 });
  return page?.items?.[0] ?? null;
};

export const saveConnection = async (db, token) => {
  const profile = await mlGet(token.access_token, "/users/me").catch(() => null);
  const payload = {
    platform: "mercado_livre",
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: new Date(Date.now() + Number(token.expires_in ?? 21600) * 1000).toISOString(),
    external_user_id: String(token.user_id ?? profile?.id ?? ""),
    nickname: profile?.nickname ?? null,
    status: "connected",
    connected_at: new Date().toISOString(),
  };
  const existing = await readConnection(db);
  return existing
    ? db.entities.MarketplaceConnection.update(existing.id, payload)
    : db.entities.MarketplaceConnection.create(payload);
};

export const getAccessToken = async (db) => {
  const creds = mlCredentials();
  if (!creds) return { error: "missing_credentials" };

  const connection = await readConnection(db);
  if (!connection?.refresh_token) return { error: "not_connected" };

  const expiresAt = new Date(connection.expires_at).getTime();
  if (connection.access_token && expiresAt - Date.now() > 5 * 60 * 1000) {
    return { token: connection.access_token, connection };
  }

  const refreshed = await requestToken({
    grant_type: "refresh_token",
    client_id: creds.clientId,
    client_secret: creds.clientSecret,
    refresh_token: connection.refresh_token,
  });

  await db.entities.MarketplaceConnection.update(connection.id, {
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token ?? connection.refresh_token,
    expires_at: new Date(Date.now() + Number(refreshed.expires_in ?? 21600) * 1000).toISOString(),
    status: "connected",
  });

  return { token: refreshed.access_token, connection };
};