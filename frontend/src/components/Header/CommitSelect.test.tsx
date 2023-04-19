import { fireEvent, screen, waitFor } from "@testing-library/react";
import { render } from "test-utils";
import CommitSelect from "./CommitSelect";

describe("commit select box", () => {
  it("loads", async () => {
    render(<CommitSelect />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("combobox")).toBeInTheDocument(); // Loaded
  });

  it("is labeled", async () => {
    render(<CommitSelect />);
    expect(await screen.findByRole("combobox")).toHaveAccessibleName("Commit");
  });
});

describe("latest checkbox", () => {
  test("loads", async () => {
    render(<CommitSelect />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("checkbox")).toBeInTheDocument(); // Loaded
  });

  it("is labeled", async () => {
    render(<CommitSelect />);
    expect(await screen.findByRole("checkbox")).toHaveAccessibleName("Latest");
  });

  it("can be checked and unchecked", async () => {
    render(<CommitSelect />);
    const latestCheckbox = await screen.findByRole("checkbox");
    expect(latestCheckbox).toBeChecked(); // Initially checked
    fireEvent.click(latestCheckbox);
    await waitFor(() => expect(latestCheckbox).not.toBeChecked()); // Unchecked
    fireEvent.click(latestCheckbox);
    await waitFor(() => expect(latestCheckbox).toBeChecked()); // Checked again
  });
});
