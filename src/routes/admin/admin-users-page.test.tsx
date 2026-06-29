import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminUser } from "@/api/admin";
import { AuthProvider } from "@/auth/auth-provider";
import { tokenStore } from "@/lib/http";
import { routes } from "@/router";

const meResponse = {
  id: 1,
  email: "admin@example.com",
  nickname: "관리자",
  role: "ADMIN",
};

function renderAt(path: string) {
  localStorage.setItem("accessToken", "test-token");
  localStorage.setItem("refreshToken", "test-refresh");
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

function pageResponse(
  content: AdminUser[],
  overrides: Partial<{
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
  }> = {},
) {
  return {
    content,
    page: 0,
    size: 20,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    first: true,
    last: true,
    ...overrides,
  };
}

function stubApi(handlers: {
  users?: () => Response;
  deleteUser?: () => Response;
}) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string | URL, init?: RequestInit) => {
      const target = String(url);
      if (target.endsWith("/api/auth/me")) return jsonResponse(meResponse);
      if (target.includes("/api/admin/users")) {
        if (init?.method === "DELETE") {
          return (
            handlers.deleteUser ?? (() => jsonResponse(undefined, 204))
          )();
        }
        return (handlers.users ?? (() => jsonResponse(pageResponse(users))))();
      }
      return jsonResponse({ message: "not found" }, 404);
    }),
  );
}

const users: AdminUser[] = [
  {
    id: 1,
    email: "admin@example.com",
    nickname: "관리자",
    role: "ADMIN",
    createdAt: "2024-01-01T09:00:00",
    updatedAt: "2024-01-01T09:00:00",
  },
  {
    id: 2,
    email: "user@example.com",
    nickname: "일반",
    role: "USER",
    createdAt: "2024-02-01T09:00:00",
    updatedAt: "2024-02-01T09:00:00",
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("AdminUsersPage", () => {
  it("lists users from the admin API", async () => {
    stubApi({});

    renderAt("/admin");

    expect(
      await screen.findByRole("link", { name: "admin@example.com" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "user@example.com" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "관리자" })).toBeInTheDocument();
  });

  it("navigates between pages", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/me")) return jsonResponse(meResponse);
        if (target.includes("/api/admin/users")) {
          const requestedPage = Number(
            new URL(target).searchParams.get("page") ?? "0",
          );
          const content = requestedPage === 0 ? [users[0]] : [users[1]];
          return jsonResponse(
            pageResponse(content, {
              page: requestedPage,
              size: 1,
              totalElements: 2,
              totalPages: 2,
              first: requestedPage === 0,
              last: requestedPage === 1,
            }),
          );
        }
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/admin");

    expect(
      await screen.findByRole("link", { name: "admin@example.com" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다음" }));

    expect(
      await screen.findByRole("link", { name: "user@example.com" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "admin@example.com" }),
    ).not.toBeInTheDocument();
  });

  it("jumps to a page via its number", async () => {
    const user = userEvent.setup();
    const third: AdminUser = {
      id: 3,
      email: "third@example.com",
      nickname: "셋째",
      role: "USER",
      createdAt: "2024-03-01T09:00:00",
      updatedAt: "2024-03-01T09:00:00",
    };
    const paged = [users[0], users[1], third];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/me")) return jsonResponse(meResponse);
        if (target.includes("/api/admin/users")) {
          const requestedPage = Number(
            new URL(target).searchParams.get("page") ?? "0",
          );
          return jsonResponse(
            pageResponse([paged[requestedPage]], {
              page: requestedPage,
              size: 1,
              totalElements: 3,
              totalPages: 3,
              first: requestedPage === 0,
              last: requestedPage === 2,
            }),
          );
        }
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/admin");

    await screen.findByRole("link", { name: "admin@example.com" });
    await user.click(screen.getByRole("button", { name: "페이지 3" }));

    expect(
      await screen.findByRole("link", { name: "third@example.com" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no users", async () => {
    stubApi({ users: () => jsonResponse(pageResponse([])) });

    renderAt("/admin");

    expect(
      await screen.findByText("표시할 사용자가 없습니다"),
    ).toBeInTheDocument();
  });

  it("shows a permission message when the API responds with 403", async () => {
    stubApi({ users: () => jsonResponse({ message: "forbidden" }, 403) });

    renderAt("/admin");

    expect(await screen.findByText("접근 권한이 없습니다")).toBeInTheDocument();
  });

  it("surfaces the server message when delete is blocked", async () => {
    const user = userEvent.setup();
    stubApi({
      deleteUser: () =>
        jsonResponse({ message: "마지막 관리자는 삭제할 수 없습니다." }, 409),
    });

    renderAt("/admin");

    await user.click(
      await screen.findByRole("button", { name: "user@example.com 삭제" }),
    );
    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "마지막 관리자는 삭제할 수 없습니다.",
    );
  });

  it("shows a success message after deleting a user", async () => {
    const user = userEvent.setup();
    stubApi({});

    renderAt("/admin");

    await user.click(
      await screen.findByRole("button", { name: "user@example.com 삭제" }),
    );
    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(await screen.findByText(/계정을 삭제했습니다/)).toBeInTheDocument();
  });

  it("blocks non-admin users from the admin area", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/me")) {
          return jsonResponse({ ...meResponse, role: "USER" });
        }
        if (target.includes("/api/admin/users")) {
          return jsonResponse(pageResponse(users));
        }
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/admin");

    expect(
      await screen.findByText("관리자만 접근할 수 있는 페이지입니다."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "관리자" }),
    ).not.toBeInTheDocument();
  });

  it("re-checks the role on admin entry and blocks a demoted user", async () => {
    let meCalls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL) => {
        const target = String(url);
        if (target.endsWith("/api/auth/me")) {
          meCalls += 1;
          return jsonResponse({
            ...meResponse,
            role: meCalls === 1 ? "ADMIN" : "USER",
          });
        }
        if (target.includes("/api/admin/users")) {
          return jsonResponse(pageResponse(users));
        }
        return jsonResponse({ message: "not found" }, 404);
      }),
    );

    renderAt("/admin");

    expect(
      await screen.findByText("관리자만 접근할 수 있는 페이지입니다."),
    ).toBeInTheDocument();
  });

  it("redirects to login when the session is cleared mid-session", async () => {
    stubApi({});

    renderAt("/admin");
    await screen.findByRole("link", { name: "admin@example.com" });

    act(() => {
      tokenStore.clear();
    });

    expect(
      await screen.findByRole("button", { name: "로그인" }),
    ).toBeInTheDocument();
  });
});
