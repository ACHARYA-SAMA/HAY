import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

afterEach(cleanup);

describe("Button busy and disabled activation", () => {
  it("blocks a busy button from submitting its action", () => {
    const action = vi.fn();
    render(<Button aria-busy="true" onClick={action}>Pay</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(action).not.toHaveBeenCalled();
    expect(screen.getByRole("button")).toHaveTextContent("PRINTING");
  });

  it("blocks an asChild link while busy, then permits it once ready", () => {
    const action = vi.fn((event) => event.preventDefault());
    const { rerender } = render(<Button asChild aria-busy="true" onClick={action}><a href="/wallet">Wallet</a></Button>);
    fireEvent.click(screen.getByRole("link"));
    expect(action).not.toHaveBeenCalled();
    rerender(<Button asChild onClick={action}><a href="/wallet">Wallet</a></Button>);
    fireEvent.click(screen.getByRole("link"));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
