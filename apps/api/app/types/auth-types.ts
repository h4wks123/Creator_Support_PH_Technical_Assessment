export interface AuthenticatedUser {
  userId: string;
  email?: string;
}

export interface JwtClaims {
  sub: string;
  email?: string;
}
