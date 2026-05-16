import { useMutation, useQuery } from "@tanstack/react-query";

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

async function login(data: LoginRequest): Promise<AuthTokens> {
  const tokens = await request<AuthTokens>("/api/auth/login", {
    method: "POST",
    body: data,
    auth: false,
  });
  tokenStore.set(tokens.accessToken, tokens.refreshToken);
  return tokens;
}

async function logout(): Promise<void> {
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

async function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/auth/me");
}

export function useMeQuery() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: !!tokenStore.getAccess(),
  });
}

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}

export function useLogoutMutation() {
  return useMutation({ mutationFn: logout });
}
