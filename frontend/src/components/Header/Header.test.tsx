import { render, screen } from "@testing-library/react";
import Header from "./Header";

it("renders", async () => {
  render(<Header />);

  expect(await screen.findByText("test.db")).toBeVisible();
});
