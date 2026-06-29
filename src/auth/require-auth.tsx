import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";

import { authKeys } from "@/api/auth";
import { useAuth } from "@/auth/auth-context";
import { Button } from "@/components/ui/button";

interface RequireAuthProps {
  requireAdmin?: boolean;
}

export function RequireAuth({ requireAdmin = false }: RequireAuthProps) {
  const { status, isAdmin } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    // 관리자 영역에 들어올 때 현재 사용자 정보를 재검증해 권한 변경(승격·강등)을 빨리 반영한다.
    if (requireAdmin && status === "authenticated") {
      queryClient.invalidateQueries({ queryKey: authKeys.me });
    }
  }, [requireAdmin, status, queryClient]);

  if (status === "loading") {
    return (
      <div
        role="status"
        className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-500"
      >
        로그인 상태를 확인하는 중입니다…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-base font-semibold text-slate-950">
          접근 권한이 없습니다
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          관리자만 접근할 수 있는 페이지입니다.
        </p>
        <div className="mt-4">
          <Button asChild variant="secondary">
            <Link to="/">홈으로</Link>
          </Button>
        </div>
      </section>
    );
  }

  return <Outlet />;
}
