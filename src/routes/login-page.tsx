import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useAuth } from "@/auth/auth-context";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/http";

interface LoginLocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as LoginLocationState | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      navigate(from, { replace: true });
    }
  }, [status, from, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-950">Post Spring</h1>
          <p className="mt-1 text-sm text-slate-600">로그인하고 계속하세요.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && <Alert tone="error">{error}</Alert>}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              이메일
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "로그인 중…" : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
