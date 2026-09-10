const AUTH_COOKIE = "auth_token";
const ONE_DAY_IN_SECONDS = 86400;

export const saveAuthToken = (token: string) => {
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=${ONE_DAY_IN_SECONDS}; SameSite=Lax`;
};

export const clearAuthToken = () => {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};
