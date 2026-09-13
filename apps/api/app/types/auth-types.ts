import { z } from "zod";

export const credentialsBodySchema = z.object({
  email: z.string().optional(),
  password: z.string().optional(),
});
export type CredentialsBody = z.infer<typeof credentialsBodySchema>;

export const authenticatedUserSchema = z.object({
  userId: z.string(),
  email: z.string().optional(),
});
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;

export const jwtClaimsSchema = z.object({
  sub: z.string(),
  email: z.string().optional(),
});
export type JwtClaims = z.infer<typeof jwtClaimsSchema>;
