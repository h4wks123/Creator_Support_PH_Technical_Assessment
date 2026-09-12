const internalApiUrl = process.env.APP_API_URL;
const publicApiUrl = process.env.NEXT_PUBLIC_APP_API_URL;

const normalizeApiUrl = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value.replace(/\/+$/, "");
};

export const getApiUrl = () =>
  typeof window === "undefined"
    ? normalizeApiUrl(internalApiUrl, "APP_API_URL")
    : normalizeApiUrl(publicApiUrl, "NEXT_PUBLIC_APP_API_URL");

export const getPublicApiUrl = () =>
  normalizeApiUrl(publicApiUrl, "NEXT_PUBLIC_APP_API_URL");
