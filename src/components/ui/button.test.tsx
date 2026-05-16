import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders and handles clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>저장</Button>);

    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
