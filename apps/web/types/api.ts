import type { UserRow } from "./database";

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message?: string;
}

export interface RegisterResponse {
  token: string;
  user: RegisteredUser;
  message?: string;
}

export interface RegisteredUser {
  id: UserRow["id"];
  user_name: UserRow["user_name"];
  user_email: UserRow["user_email"];
  user_created_at: UserRow["user_created_at"];
}
