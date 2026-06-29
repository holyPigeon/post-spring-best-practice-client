import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminUser } from "@/api/admin";
import { AuthProvider } from "@/auth/auth-provider";
import { routes } from "@/router";

const meResponse = { id: 1, email: "admin@example.com", nickname: "관리자" };

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
        return (handlers.users ?? (() => jsonResponse(users)))();
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
  });

  it("filters users by the search keyword", async () => {
    const user = userEvent.setup();
    stubApi({});

    renderAt("/admin");
    await screen.findByRole("link", { name: "admin@example.com" });

    await user.type(
      screen.getByRole("searchbox", { name: "사용자 검색" }),
      "user@",
    );

    expect(
      screen.queryByRole("link", { name: "admin@example.com" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "user@example.com" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no users", async () => {
    stubApi({ users: () => jsonResponse([]) });

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

  it("keeps the dialog open with an error when delete fails", async () => {
    const user = userEvent.setup();
    stubApi({
      deleteUser: () => jsonResponse({ message: "forbidden" }, 403),
    });

    renderAt("/admin");

    await user.click(
      await screen.findByRole("button", { name: "user@example.com 삭제" }),
    );
    await user.click(screen.getByRole("button", { name: "삭제" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "삭제하지 못했습니다",
    );
  });
});
