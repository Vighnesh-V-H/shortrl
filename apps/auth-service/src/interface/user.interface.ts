import type { User } from "@shortrl/db/schema";

export interface SignupRequest {
  email: string;
  name: string;
  password: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
