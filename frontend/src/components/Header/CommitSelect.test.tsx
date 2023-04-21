import userEvent from "@testing-library/user-event";
import { render, screen, within } from "test-utils";
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

  it("initially contains the latest commit", async () => {
    render(<CommitSelect />);
    const commitSelectBox = await screen.findByRole("combobox");
    expect(commitSelectBox).toHaveValue("3: Latest commit");
    expect(screen.getByDate("2023-01-03T00:00:00.000Z")).toBeInTheDocument();
  });

  it("can search for another commit by message and switch to it", async () => {
    const user = userEvent.setup();
    render(<CommitSelect />);
    const commitSelectBox = await screen.findByRole("combobox");
    await user.type(commitSelectBox, "initial{Enter}");
    expect(commitSelectBox).toHaveValue("1: Initial commit");
    expect(screen.getByDate("2023-01-01T00:00:00.000Z")).toBeInTheDocument();
  });
});

describe("latest checkbox", () => {
  it("loads", async () => {
    render(<CommitSelect />);
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("checkbox")).toBeInTheDocument(); // Loaded
  });

  it("is labeled", async () => {
    render(<CommitSelect />);
    expect(await screen.findByRole("checkbox")).toHaveAccessibleName("Latest");
  });

  it("can be checked and unchecked", async () => {
    const user = userEvent.setup();
    render(<CommitSelect />);
    const latestCheckbox = await screen.findByRole("checkbox");
    expect(latestCheckbox).toBeChecked(); // Initially checked
    await user.click(latestCheckbox);
    expect(latestCheckbox).not.toBeChecked(); // Unchecked
    await user.click(latestCheckbox);
    expect(latestCheckbox).toBeChecked(); // Checked again
  });
});

describe("commit list", () => {
  it("opens and closes when commit select box is clicked and clicked off of", async () => {
    const user = userEvent.setup();
    render(<CommitSelect />);
    const commitSelectBox = await screen.findByRole("combobox");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Initially closed
    await user.click(commitSelectBox);
    expect(screen.getByRole("listbox")).toBeInTheDocument(); // Opened
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Closed again
  });

  it("contains commit ids, messages, and dates", async () => {
    const user = userEvent.setup();
    render(<CommitSelect />);
    await user.click(await screen.findByRole("combobox"));
    const commitList = screen.getByRole("listbox");
    expect(within(commitList).getByText("1: Initial commit")).toBeInTheDocument();
    expect(within(commitList).getByDate("2023-01-01T00:00:00.000Z")).toBeInTheDocument();
    expect(within(commitList).getByText("2: Updated something")).toBeInTheDocument();
    expect(within(commitList).getByDate("2023-01-02T00:00:00.000Z")).toBeInTheDocument();
    expect(within(commitList).getByText("3: Latest commit")).toBeInTheDocument();
    expect(within(commitList).getByDate("2023-01-03T00:00:00.000Z")).toBeInTheDocument();
  });

  it("filters commits when typing", async () => {
    const user = userEvent.setup();
    render(<CommitSelect />);
    const commitSelectBox = await screen.findByRole("combobox");
    await user.type(commitSelectBox, "commit");
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).queryByText("2: Updated something")).not.toBeInTheDocument();
    expect(
      within(listbox).queryByText("2023-01-02T00:00:00.000Z"),
    ).not.toBeInTheDocument();
    expect(within(listbox).getByText("1: Initial commit")).toBeInTheDocument();
    expect(within(listbox).getByDate("2023-01-01T00:00:00.000Z")).toBeInTheDocument();
    expect(within(listbox).getByText("3: Latest commit")).toBeInTheDocument();
    expect(within(listbox).getByDate("2023-01-03T00:00:00.000Z")).toBeInTheDocument();
  });
});
