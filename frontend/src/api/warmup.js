import { WARMUP_ENDPOINT } from "./endpoints";

const WARMUP_REQUESTED_AT_KEY = "studentassistant_backend_warmup_requested_at";
const WARMUP_COOLDOWN_MS = 2 * 60 * 1000;

function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function warmupBackend({ signal, keepalive = false } = {}) {
  const storage = getSessionStorage();
  const now = Date.now();
  let previousRequestAt = 0;
  try {
    previousRequestAt = Number(storage?.getItem(WARMUP_REQUESTED_AT_KEY));
  } catch {
    // Continue without cross-page deduplication when storage is unavailable.
  }

  if (previousRequestAt && now >= previousRequestAt && now - previousRequestAt < WARMUP_COOLDOWN_MS) {
    return Promise.resolve(null);
  }

  const requestAt = String(now);
  try {
    storage?.setItem(WARMUP_REQUESTED_AT_KEY, requestAt);
  } catch {
    // Continue with the request when session storage is unavailable.
  }

  return fetch(WARMUP_ENDPOINT, {
    cache: "no-store",
    ...(signal ? { signal } : {}),
    ...(keepalive ? { keepalive: true } : {}),
  }).then(response => {
    if (!response.ok) throw new Error(`Backend warmup failed (${response.status})`);
    return response;
  }).catch(error => {
    try {
      if (storage?.getItem(WARMUP_REQUESTED_AT_KEY) === requestAt) {
        storage.removeItem(WARMUP_REQUESTED_AT_KEY);
      }
    } catch {
      // A later page visit can retry even if session storage became unavailable.
    }
    throw error;
  });
}
