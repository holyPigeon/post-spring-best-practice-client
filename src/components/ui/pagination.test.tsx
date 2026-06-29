import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "@/components/ui/pagination";

describe("Pagination", () => {
  it("renders every page when the total is small", () => {
    render(<Pagination page={0} totalPages={3} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "페이지 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "페이지 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "페이지 3" }),
    ).toBeInTheDocument();
  });

  it("truncates distant pages with an ellipsis", () => {
    render(<Pagination page={5} totalPages={20} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "페이지 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "페이지 20" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "페이지 6" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.queryByRole("button", { name: "페이지 10" }),
    ).not.toBeInTheDocument();
  });

  it("calls onPageChange with the zero-based target page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<Pagination page={0} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByRole("button", { name: "페이지 3" }));

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("disables prev on the first page and next on the last", () => {
    const { rerender } = render(
      <Pagination page={0} totalPages={3} onPageChange={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: "이전" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "다음" })).not.toBeDisabled();

    rerender(<Pagination page={2} totalPages={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "다음" })).toBeDisabled();
  });
});
