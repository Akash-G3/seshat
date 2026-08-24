import { apiClient } from "@lib/api-client";
import type { LoginInput, SignupInput } from "./auth.schema";

export async function loginRequest(input: LoginInput): Promise<void> {
  // Backend sets httpOnly cookies on success; body isn't needed here.
  await apiClient.post("/auth/login", input);
}

export async function signupRequest(input: SignupInput): Promise<void> {
  const { confirmPassword: _confirmPassword, ...payload } = input;
  // confirmPassword is frontend-only — backend never sees it.
  await apiClient.post("/auth/register", payload);
}

export async function logoutRequest(): Promise<void> {
  await apiClient.post("/auth/logout");
}