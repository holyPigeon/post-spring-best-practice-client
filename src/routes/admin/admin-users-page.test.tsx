import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AdminUser } from "@/api/admin";
import { routes } from "@/router";

function renderAt(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [path] });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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
});

describe("AdminUsersPage", () => {
  it("lists users from the admin API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(users)),
    );

    renderAt("/admin");

    expect(
      await screen.findByRole("link", { name: "admin@example.com" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "user@example.com" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no users", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse([])),
    );

    renderAt("/admin");

    expect(
      await screen.findByText("표시할 사용자가 없습니다"),
    ).toBeInTheDocument();
  });

  it("shows a permission message when the API responds with 403", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ message: "forbidden" }, 403)),
    );

    renderAt("/admin");

    expect(await screen.findByText("접근 권한이 없습니다")).toBeInTheDocument();
  });

  it("keeps the dialog open with an error when delete fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) =>
        init?.method === "DELETE"
          ? jsonResponse({ message: "forbidden" }, 403)
          : jsonResponse(users),
      ),
    );

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
