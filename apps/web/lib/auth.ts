const AUTH_COOKIE = "auth_token";
export const AUTH_CHANGE_EVENT = "auth-token-changed";
const ONE_DAY_IN_SECONDS = 86400;

const readAuthToken = () => {
  if (typeof document === "undefined") {
    return "";
  }

  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`))
    ?.split("=")[1];
};

export const getAuthToken = () => readAuthToken();

const decodeJwtPayload = (token: string) => {
  const payload = token.split(".")[1];

  if (!payload) {
    return null;
  }

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return JSON.parse(atob(padded)) as { email?: string };
};

export const saveAuthToken = (token: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${ONE_DAY_IN_SECONDS}; SameSite=Lax`;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const clearAuthToken = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};

export const getLoggedInEmail = () => {
  const token = readAuthToken();

  if (!token) {
    return "";
  }

  try {
    return decodeJwtPayload(token)?.email ?? "";
  } catch {
    return "";
  }
};
