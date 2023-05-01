import { render, screen } from "test-utils";
import Header from "./Header";

describe("database name", () => {
  it("loads", async () => {
    render(<Header />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("heading")).toBeInTheDocument(); // Loaded
  });

  it("contains the database name", async () => {
    render(<Header />);
    expect(await screen.findByRole("heading")).toHaveTextContent("test.db");
  });
});
