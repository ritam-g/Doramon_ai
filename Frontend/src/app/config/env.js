function trimTrailingSlash(value = "") {
  return value.replace(/\/+$/, "");
}

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const rawSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();

export const API_BASE_URL = trimTrailingSlash(rawApiUrl || "/api");

// Default to same-origin in production so frontend and backend can share one domain.
export const SOCKET_URL = rawSocketUrl
  ? trimTrailingSlash(rawSocketUrl)
  : window.location.origin;
