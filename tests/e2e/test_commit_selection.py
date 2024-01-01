"""Tests for commit selection."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import reset_db, CommitInfo

FIRST_COMMIT = CommitInfo(1)
LATEST_COMMIT = CommitInfo(3)


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db(3)
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
    commit_id_item = page.get_by_test_id("parameter-list-item-commit_id")

    # Search and select first commit
    commit_select_combobox_input.fill(FIRST_COMMIT.message[:8])
    commit_select_combobox_input.press("Enter")
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
    latest_checkbox.check()
    expect(latest_checkbox).to_be_checked()
    expect(commit_select_combobox).to_contain_text(LATEST_COMMIT.date)
    expect(commit_select_combobox_input).to_have_value(LATEST_COMMIT.message)
    expect(commit_id_item).to_have_text(f"commit_id{LATEST_COMMIT.id}")
