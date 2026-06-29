import { request, tokenStore } from "@/lib/http";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface MeResponse {
  id: number;
  email: string;
  nickname: string;
}

export const authKeys = {
  me: ["auth", "me"] as const,
};

export async function login(data: LoginRequest): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>("/api/auth/login", {
    method: "POST",
    body: data,
    auth: false,
  });
  tokenStore.set(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (refreshToken) {
    await request<undefined>("/api/auth/logout", {
      method: "POST",
      body: { refreshToken } satisfies LogoutRequest,
      auth: false,
    });
  }
  tokenStore.clear();
}

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/auth/me");
}
