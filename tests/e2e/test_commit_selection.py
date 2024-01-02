"""Tests for commit selection."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import CommitInfo, reset_db, commit_to_db

NUM_COMMITS = 3
FIRST_COMMIT = CommitInfo(1)
LATEST_COMMIT = CommitInfo(NUM_COMMITS)


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db(NUM_COMMITS)
    page.goto("/")


def test_commit_select_inputs(page: Page) -> None:
    """Displays the latest commit, latest is checked, and inputs are not disabled."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    latest_checkbox = page.get_by_test_id("latest-checkbox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(latest_checkbox).to_be_checked()
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")


def test_commit_search(page: Page) -> None:
    """Searches for the initial commit and switches to it."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    commit_select_listbox = page.get_by_test_id("commit-select-listbox")
    commit_select_option = commit_select_listbox.get_by_test_id(
        f"commit-select-option-{FIRST_COMMIT.id}"
    )
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    # Search for first commit
    commit_select_combobox_input.fill(FIRST_COMMIT.message[:8])
    expect(commit_select_listbox).to_be_attached()
    expect(commit_select_option).to_contain_text(
        FIRST_COMMIT.message + FIRST_COMMIT.date
    )

    # Select the first commit
    commit_select_combobox_input.press("Enter")
    expect(commit_select_listbox).not_to_be_attached()
    expect(commit_select_combobox).to_contain_text(FIRST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(FIRST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{FIRST_COMMIT.id}")


def test_latest_checkbox(page: Page) -> None:
    """Switches to latest commit when latest checkbox is checked."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    latest_checkbox = page.get_by_test_id("latest-checkbox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    # Switch to first commit
    commit_select_combobox_input.fill(FIRST_COMMIT.message[:8])
    commit_select_combobox_input.press("Enter")
    expect(latest_checkbox).not_to_be_checked()

    # Check the latest checkbox
    latest_checkbox.click()
    expect(latest_checkbox).to_be_checked()
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")


def test_commit_list_virtualization(page: Page) -> None:
    """Uses virtualization for long commit lists."""
    num_commits = 100
    latest_commit = CommitInfo(num_commits)
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_listbox = page.get_by_test_id("commit-select-listbox")

    # Reset to a long list of commits
    reset_db(num_commits)

    # Commit list contains latest commit, but not the first (due to virtualization)
    commit_select_combobox.click()
    expect(commit_select_listbox).to_contain_text(latest_commit.message)
    expect(commit_select_listbox).not_to_contain_text(FIRST_COMMIT.message)

    # After scrolling, the commit list contains the first commit, but not the latest
    commit_select_listbox.evaluate("(elem) => elem.scrollTo(0, elem.scrollHeight)")
    expect(commit_select_listbox).not_to_contain_text(latest_commit.message)
    expect(commit_select_listbox).to_contain_text(FIRST_COMMIT.message)


def test_latest_checked_updates(page: Page) -> None:
    """Updates to latest commit when the latest checkbox is checked."""
    latest_commit = CommitInfo(NUM_COMMITS + 1)
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    # Commit select contains original latest commit
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")

    commit_to_db()

    # Commit select contains the new latest commit
    expect(commit_select_combobox).to_contain_text(latest_commit.date)
    expect(commit_select_combobox_input).to_have_value(latest_commit.message)
    expect(commit_id_item).to_have_text(f"commit_id{latest_commit.id}")


def test_latest_unchecked_does_not_update(page: Page) -> None:
    """Does not update to latest commit when the latest checkbox is unchecked."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    page.get_by_test_id("latest-checkbox").click()
    commit_to_db()

    # Commit select contains original latest commit
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")


def test_edit_mode_commit_select_inputs_disabled(page: Page) -> None:
    """Commit select inputs are disabled in edit mode."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    latest_checkbox = page.get_by_test_id("latest-checkbox")

    # Inputs are originally enabled
    expect(commit_select_combobox_input).to_be_enabled()
    expect(latest_checkbox).to_be_enabled()

    # In edit mode, inputs are disabled
    page.get_by_test_id("edit-button").click()
    expect(commit_select_combobox_input).to_be_disabled()
    expect(latest_checkbox).to_be_disabled()

    # Out of edit mode, inputs are enabled again
    page.get_by_test_id("cancel-edit-button").click()
    expect(commit_select_combobox_input).to_be_enabled()
    expect(latest_checkbox).to_be_enabled()


def test_change_commit_after_exiting_edit_mode(page: Page) -> None:
    """Can change commit after entering and exiting edit mode (previous bug)."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    page.get_by_test_id("edit-button").click()
    page.get_by_test_id("cancel-edit-button").click()

    # Switch to first commit
    commit_select_combobox_input.fill(FIRST_COMMIT.message[:8])
    commit_select_combobox_input.press("Enter")
    expect(commit_select_combobox).to_contain_text(FIRST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(FIRST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{FIRST_COMMIT.id}")


def test_edit_mode_latest_checked(page: Page) -> None:
    """
    When latest is checked, it is unchecked it edit mode, and rechecked when edit mode
    is exited.
    """
    latest_commit = CommitInfo(NUM_COMMITS + 1)
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    latest_checkbox = page.get_by_test_id("latest-checkbox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")
    commit_id_input = commit_id_item.get_by_test_id("leaf-input").get_by_role("textbox")

    # In edit mode, latest checkbox is unchecked
    page.get_by_test_id("edit-button").click()
    expect(latest_checkbox).not_to_be_checked()

    # Current commit does not update
    commit_to_db()
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_input).to_have_value(f"{LATEST_COMMIT.id}")

    # Out of edit mode, latest checkbox is checked and current commit updates
    page.get_by_test_id("cancel-edit-button").click()
    expect(latest_checkbox).to_be_checked()
    expect(commit_select_combobox).to_contain_text(latest_commit.date)
    expect(commit_select_combobox_input).to_have_value(latest_commit.message)
    expect(commit_id_item).to_have_text(f"commit_id{latest_commit.id}")


def test_edit_mode_latest_unchecked(page: Page) -> None:
    """
    When latest is unchecked, it is unchecked it edit mode, and still unchecked when
    edit mode is exited.
    """
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    latest_checkbox = page.get_by_test_id("latest-checkbox")
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")
    commit_id_input = commit_id_item.get_by_test_id("leaf-input").get_by_role("textbox")

    # In edit mode, latest checkbox is unchecked
    latest_checkbox.click()
    page.get_by_test_id("edit-button").click()
    expect(latest_checkbox).not_to_be_checked()

    # Current commit does not update
    commit_to_db()
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_input).to_have_value(f"{LATEST_COMMIT.id}")

    # Out of edit mode, latest checkbox is checked and current commit updates
    page.get_by_test_id("cancel-edit-button").click()
    expect(latest_checkbox).not_to_be_checked()
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")
