import { request, tokenStore } from "@/lib/http";

export type UserRole = "USER" | "ADMIN";

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
  role: UserRole;
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
  try {
    if (refreshToken) {
      await request<undefined>("/api/auth/logout", {
        method: "POST",
        body: { refreshToken } satisfies LogoutRequest,
        auth: false,
      });
    }
  } finally {
    // 서버 로그아웃 실패와 무관하게 로컬 세션은 반드시 정리한다.
    tokenStore.clear();
  }
}

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/auth/me");
}
