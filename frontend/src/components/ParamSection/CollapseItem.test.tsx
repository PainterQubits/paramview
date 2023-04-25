import { render, screen } from "test-utils";
import userEvent from "@testing-library/user-event";
import CollapseItem from "./CollapseItem";

it("can be closed by default", () => {
  render(
    <CollapseItem defaultOpen={false} itemContent={<div>Item Content</div>}>
      <div>Child</div>
    </CollapseItem>,
  );
  expect(screen.getByRole("button")).toBeInTheDocument();
  expect(screen.getByText("Item Content")).toBeInTheDocument();
  expect(screen.getByTestId("ChevronRightIcon")).toBeInTheDocument();
  expect(screen.queryByText("Child")).not.toBeInTheDocument();
});

it("can be open by default", () => {
  render(
    <CollapseItem defaultOpen={true} itemContent={<div>Item Content</div>}>
      <div>Child</div>
    </CollapseItem>,
  );
  expect(screen.getByRole("button")).toBeInTheDocument();
  expect(screen.getByText("Item Content")).toBeInTheDocument();
  expect(screen.getByTestId("ExpandMoreIcon")).toBeInTheDocument();
  expect(screen.getByText("Child")).toBeInTheDocument();
});

it("expands and closes when clicked", async () => {
  const user = userEvent.setup();
  render(
    <CollapseItem defaultOpen={false} itemContent={<div>Item Content</div>}>
      <div>Child</div>
    </CollapseItem>,
  );
  const collapseButton = screen.getByRole("button");
  await user.click(collapseButton);
  expect(screen.getByTestId("ExpandMoreIcon")).toBeInTheDocument();
  expect(screen.getByText("Child")).toBeInTheDocument();
  await user.click(collapseButton);
  expect(screen.getByTestId("ChevronRightIcon")).toBeInTheDocument();
  expect(screen.queryByText("Child")).not.toBeInTheDocument();
});
