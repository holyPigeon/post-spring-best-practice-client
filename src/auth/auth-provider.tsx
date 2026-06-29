import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";

import {
  authKeys,
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  type LoginRequest,
} from "@/api/auth";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from "@/auth/auth-context";
import { tokenStore } from "@/lib/http";

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const accessToken = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getAccess,
    tokenStore.getAccess,
  );

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: accessToken !== null,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    // 토큰이 비워지면(만료·다른 탭 로그아웃 포함) 캐시된 사용자 정보를 버린다.
    if (accessToken === null) {
      queryClient.removeQueries({ queryKey: authKeys.me });
    }
  }, [accessToken, queryClient]);

  const login = useCallback(
    async (data: LoginRequest) => {
      await loginRequest(data);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // 서버 로그아웃 실패는 무시한다. 로컬 토큰은 logout()의 finally에서 정리된다.
    }
    queryClient.removeQueries({ queryKey: authKeys.me });
  }, [queryClient]);

  const status: AuthStatus =
    accessToken === null
      ? "unauthenticated"
      : meQuery.isError
        ? "unauthenticated"
        : meQuery.isSuccess
          ? "authenticated"
          : "loading";

  const value = useMemo<AuthContextValue>(
    () => ({ user: meQuery.data ?? null, status, login, logout }),
    [meQuery.data, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
