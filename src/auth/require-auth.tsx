import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "@/auth/auth-context";

export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

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

  return <Outlet />;
}
