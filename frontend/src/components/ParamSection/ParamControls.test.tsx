import { render, screen } from "test-utils";
import userEvent from "@testing-library/user-event";
import LeafItemContent from "@/components/ParamSection/LeafItemContent";
import CollapseItem from "@/components/ParamSection/CollapseItem";
import ParamControls from "./ParamControls";

describe("round switch", () => {
  it("is labeled", () => {
    render(<ParamControls />);
    expect(screen.getByRole("checkbox")).toHaveAccessibleName("Round");
  });

  it("can be checked and unchecked", async () => {
    const user = userEvent.setup();
    render(<ParamControls />);
    const roundSwitch = screen.getByRole("checkbox");
    expect(roundSwitch).toBeChecked(); // Initially checked
    await user.click(roundSwitch);
    expect(roundSwitch).not.toBeChecked(); // Unchecked
    await user.click(roundSwitch);
    expect(roundSwitch).toBeChecked(); // Checked again
  });

  it("affects whether leaf values are rounded", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ParamControls />
        <LeafItemContent name="Test" value={1.2e9} />
      </>,
    );
    const roundSwitch = screen.getByRole("checkbox");
    expect(screen.getByText("1.2e+9")).toBeInTheDocument(); // Rounded
    await user.click(roundSwitch);
    expect(screen.getByText("1200000000")).toBeInTheDocument(); // Unrounded
  });
});

describe("collapse all button", () => {
  it("is labeled", () => {
    render(<ParamControls />);
    expect(screen.getByRole("button")).toHaveAccessibleName("Collapse all");
  });

  it("resets collapse items to defaultOpen state when clicked", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ParamControls />
        <CollapseItem defaultOpen={false} itemContent={<div>Item Content</div>}>
          <div>Child</div>
        </CollapseItem>
      </>,
    );
    const collapseAllButton = screen.getByRole("button", { name: "Collapse all" });
    const collapseItem = screen.getByRole("button", { name: "Item Content" });
    await user.click(collapseItem);
    expect(screen.getByText("Child")).toBeInTheDocument(); // Open
    await user.click(collapseAllButton);
    expect(screen.queryByText("Child")).not.toBeInTheDocument(); // Collapsed
  });
});
