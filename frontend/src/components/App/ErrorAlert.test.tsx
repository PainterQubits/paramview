import { render, screen } from "test-utils";
import userEvent from "@testing-library/user-event";
import ErrorAlert from "./ErrorAlert";

const resetErrorBoundary = jest.fn();

afterEach(jest.clearAllMocks);

it("contains the message title, error message, and reload button", () => {
  render(<ErrorAlert error={Error("Message")} resetErrorBoundary={resetErrorBoundary} />);
  expect(screen.getByText("Error")).toBeInTheDocument();
  expect(screen.getByText("Message")).toBeInTheDocument();
  expect(screen.getByRole("button")).toHaveAccessibleName("Reload");
});

it("calls resetErrorBoundary when the reload button is clicked", async () => {
  const user = userEvent.setup();
  render(<ErrorAlert error={Error("Message")} resetErrorBoundary={resetErrorBoundary} />);
  await user.click(screen.getByRole("button"));
  expect(resetErrorBoundary).toHaveBeenCalledTimes(1);
});
