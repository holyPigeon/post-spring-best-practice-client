import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/auth/auth-provider";
import { routes } from "@/router";

const meResponse = { id: 1, email: "admin@example.com", nickname: "관리자" };

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("LoginPage", () => {
  it("renders the login form", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "not found" }, 404)),
    );

    renderAt("/login");

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });

  it("redirects an unauthenticated user from /admin to the login page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "not found" }, 404)),
    );

    renderAt("/admin");

    expect(
      await screen.findByRole("button", { name: "로그인" }),
    ).toBeInTheDocument();
  });

  it("logs in and leaves the login page", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/login")) {
          return jsonResponse({ accessToken: "a", refreshToken: "r" });
        }
        if (target.endsWith("/api/auth/me")) return jsonResponse(meResponse);
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/login");

    await user.type(screen.getByLabelText("이메일"), "admin@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "password");
    await user.click(screen.getByRole("button", { name: "로그인" }));

    expect(
      await screen.findByRole("heading", { name: /제품 워크스페이스/ }),
    ).toBeInTheDocument();
  });

  it("logs out and returns to the login page", async () => {
    const user = userEvent.setup();
    localStorage.setItem("accessToken", "test-token");
    localStorage.setItem("refreshToken", "test-refresh");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/me")) return jsonResponse(meResponse);
        if (target.endsWith("/api/auth/logout")) {
          return jsonResponse(undefined, 204);
        }
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/");

    await user.click(await screen.findByRole("button", { name: "로그아웃" }));

    expect(
      await screen.findByRole("button", { name: "로그인" }),
    ).toBeInTheDocument();
  });

  it("shows the not found page for an unknown route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "not found" }, 404)),
    );

    renderAt("/no-such-page");

    expect(
      await screen.findByRole("heading", { name: "페이지를 찾을 수 없습니다" }),
    ).toBeInTheDocument();
  });
});
