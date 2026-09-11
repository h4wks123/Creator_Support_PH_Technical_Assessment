import {
  credentialsSchema,
  loginResponseSchema,
  registerResponseSchema,
  type Credentials,
} from "@/types/api";

const parseError = async (response: Response) => {
  const data = await response.json().catch(() => null);
  return typeof data?.message === "string" ? data.message : "Authentication failed";
};

export const loginUser = async (credentials: Credentials) => {
  const input = credentialsSchema.parse(credentials);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) throw new Error(await parseError(response));
  return loginResponseSchema.parse(await response.json());
};

export const registerUser = async (credentials: Credentials) => {
  const input = credentialsSchema.parse(credentials);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) throw new Error(await parseError(response));
  return registerResponseSchema.parse(await response.json());
};
