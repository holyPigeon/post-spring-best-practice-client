import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type PropsWithChildren } from "react";

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
  const [accessToken, setAccessToken] = useState(() => tokenStore.getAccess());

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled: accessToken !== null,
    retry: false,
    staleTime: 5 * 60_000,
  });

  const login = useCallback(
    async (data: LoginRequest) => {
      const tokens = await loginRequest(data);
      setAccessToken(tokens.accessToken);
      await queryClient.invalidateQueries({ queryKey: authKeys.me });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setAccessToken(null);
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
