import { render, screen, within } from "test-utils";
import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { commitHistoryAtom } from "@/atoms/api";
import CommitSelect from "./CommitSelect";

/**
 * Render the CommitSelect component, calling the commitHistoryAtom set function to
 * trigger initial loading from the database.
 */
const renderWithCommitHistory = () =>
  render(<CommitSelect />, { initialValues: [[commitHistoryAtom, undefined]] });

describe("commit select box", () => {
  it("loads", async () => {
    renderWithCommitHistory();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("combobox")).toBeInTheDocument(); // Loaded
  });

  it("is labeled", async () => {
    renderWithCommitHistory();
    expect(await screen.findByRole("combobox")).toHaveAccessibleName("Commit");
  });

  it("initially contains the latest commit", async () => {
    renderWithCommitHistory();
    expect(await screen.findByRole("combobox")).toHaveValue("3: Latest commit");
    expect(screen.getByDate("2023-01-03T00:00:00.000Z")).toBeInTheDocument();
  });

  it("can search for another commit by message and switch to it", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    await user.type(commitSelectBox, "initial{Enter}");
    await waitFor(() => expect(commitSelectBox).toHaveValue("1: Initial commit"));
    expect(screen.getByDate("2023-01-01T00:00:00.000Z")).toBeInTheDocument();
  });

  it("switches to latest commit when latest checkbox is checked", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    const latestCheckbox = await screen.findByRole("checkbox");
    await user.type(commitSelectBox, "initial{Enter}");
    await user.click(latestCheckbox);
    await waitFor(() => expect(commitSelectBox).toHaveValue("3: Latest commit"));
    expect(screen.getByDate("2023-01-03T00:00:00.000Z")).toBeInTheDocument();
  });

  it("displays timestamp of currently highlighted commit", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    await user.type(commitSelectBox, "{ArrowDown}");
    expect(commitSelectBox).toHaveValue("3: Latest commit");
    // Timestamp of the second commit should show up in two locations: the commit select
    // box and the commit list.
    expect(screen.getAllByDate("2023-01-02T00:00:00.000Z")).toHaveLength(2);
  });
});

describe("latest checkbox", () => {
  it("loads", async () => {
    renderWithCommitHistory();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument(); // Loading
    expect(await screen.findByRole("checkbox")).toBeInTheDocument(); // Loaded
  });

  it("is labeled", async () => {
    renderWithCommitHistory();
    expect(await screen.findByRole("checkbox")).toHaveAccessibleName("Latest");
  });

  it("can be checked and unchecked", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const latestCheckbox = await screen.findByRole("checkbox");
    expect(latestCheckbox).toBeChecked(); // Initially checked
    await user.click(latestCheckbox);
    await waitFor(() => expect(latestCheckbox).not.toBeChecked()); // Unchecked
    await user.click(latestCheckbox);
    await waitFor(() => expect(latestCheckbox).toBeChecked()); // Checked again
  });

  it("gets unchecked when value changes", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    await user.type(commitSelectBox, "initial{Enter}");
    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
  });
});

describe("commit list", () => {
  it("opens and closes when commit select box is clicked and clicked off of", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Initially closed
    await user.click(commitSelectBox);
    expect(screen.getByRole("listbox")).toBeInTheDocument(); // Opened
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Closed again
  });

  it("opens when typing and closes when commit is selected", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
    const commitSelectBox = await screen.findByRole("combobox");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Initially closed
    await user.type(commitSelectBox, "initial");
    expect(screen.getByRole("listbox")).toBeInTheDocument(); // Opened
    await user.type(commitSelectBox, "{Enter}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument(); // Closed again
  });

  it("contains commit ids, messages, and dates", async () => {
    const user = userEvent.setup();
    renderWithCommitHistory();
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
    renderWithCommitHistory();
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
