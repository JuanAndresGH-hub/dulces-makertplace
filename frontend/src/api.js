// frontend/src/api.js

// Manejo robusto del API_URL (Vite, window, process, fallback)
export const API_URL = (() => {
  try { if (import.meta?.env?.VITE_API_URL) return import.meta.env.VITE_API_URL } catch {}
  try { if (typeof window !== "undefined" && window.__VITE_API_URL) return window.__VITE_API_URL } catch {}
  try { if (typeof process !== "undefined" && process.env?.VITE_API_URL) return process.env.VITE_API_URL } catch {}
  return "http://localhost:8000";
})();

// Helpers comunes
const headers = (token, extra = {}) => {
  const h = { Accept: "application/json", ...extra };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const parseResponse = async (res) => {
  const text = await res.text().catch(() => "");
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || res.statusText || (text || "sin cuerpo");
    const err = new Error(`HTTP ${res.status} ${res.statusText} - ${msg}`);
    err.status = res.status;
    err.body = data ?? text;
    throw err;
  }
  return data;
};

// === Exports tipo función ===
export async function apiGet(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: headers(token),
  });
  return parseResponse(res);
}

export async function apiPost(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(body ?? {}),
  });
  return parseResponse(res);
}

export async function apiPut(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: headers(token, { "Content-Type": "application/json" }),
    body: JSON.stringify(body ?? {}),
  });
  return parseResponse(res);
}

export async function apiDel(path, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: headers(token),
  });
  return parseResponse(res);
}

// === Función compatible (api('/ruta', { method, body, token })) ===
export async function api(path, opts = {}) {
  const method = (opts.method || "GET").toUpperCase();
  const token = opts.token;
  const body = opts.body;

  if (method === "GET")    return apiGet(path, token);
  if (method === "POST")   return apiPost(path, body, token);
  if (method === "PUT")    return apiPut(path, body, token);
  if (method === "DELETE") return apiDel(path, token);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: headers(token, body != null ? { "Content-Type": "application/json" } : {}),
    body: body != null ? JSON.stringify(body) : undefined,
  });
  return parseResponse(res);
}

// === Export tipo objeto para { api } ===
api.base = API_URL;
api.get  = apiGet;
api.post = apiPost;
api.put  = apiPut;
api.del  = apiDel;

export default api;
