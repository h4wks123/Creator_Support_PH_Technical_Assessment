import type { Credentials, LoginResponse, RegisterResponse } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL || "http://localhost:5000";

export const loginUser = async (credentials: Credentials) => {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
  );

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Unable to sign in");
  }
  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to sign in");
  }

  return data;
};

export const registerUser = async (credentials: Credentials) => {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
  );

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Unable to register");
  }
  const data: RegisterResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? "Unable to register");
  }

  return data;
};
