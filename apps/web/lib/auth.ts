const AUTH_COOKIE = "auth_token";
const ONE_DAY_IN_SECONDS = 86400;

const getAuthToken = () => {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${AUTH_COOKIE}=`))
    ?.split("=")[1];
};

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
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${ONE_DAY_IN_SECONDS}; SameSite=Lax`;
};

export const clearAuthToken = () => {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

export const getLoggedInEmail = () => {
  const token = getAuthToken();

  if (!token) return;

  return decodeJwtPayload(token)?.email ?? "";
};
