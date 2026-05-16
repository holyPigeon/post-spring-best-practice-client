import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { AppProviders } from "@/providers";
import { routes } from "@/router";

describe("HomePage", () => {
  it("renders the workspace dashboard", () => {
    const router = createMemoryRouter(routes, { initialEntries: ["/"] });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    );

    expect(
      screen.getByRole("heading", { name: /제품 워크스페이스/i }),
    ).toBeInTheDocument();
  });
});
