"""Tests for the commit dialog."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import reset_db

NUM_COMMITS = 3


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db(NUM_COMMITS)
    page.goto("/")
    page.get_by_test_id("edit-button").click()


def test_reopen_resets_commit_message(page: Page) -> None:
    """Commit message resets when the commit dialog is reopened."""
    open_commit_dialog_button = page.get_by_test_id("open-commit-dialog-button")
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    # Open commit dialog and type a new commit
    open_commit_dialog_button.click()
    commit_message_input.fill("New commit")
    expect(commit_message_input).to_have_value("New commit")

    # Close commit dialog
    page.get_by_test_id("close-commit-dialog-button").click()

    # When commit dialog is reopened, commit message is empty
    open_commit_dialog_button.click()
    expect(commit_message_input).to_have_value("")


def test_refuses_to_commit_with_no_message(page: Page) -> None:
    """Refuses to make a commit if there is no message."""
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    # Attempt to make a commit
    page.get_by_test_id("open-commit-dialog-button").click()
    page.get_by_test_id("make-commit-button").click()

    # Message field exists and is enabled, meaning a commit was not made
    expect(commit_message_input).to_be_enabled()


# def test_make_commit(page: Page) -> None:
#     """Can edit data and make a commit."""


# def test_commit_format(page: Page) -> None:
#     """
#     Commits in the correct format for datetime and Quantity and (i.e. the format that
#     allows them to be read by Python).
#     """
