"""Tests for the commit dialog."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import (
    CommitInfo,
    reset_db,
    load_classes_from_db,
    get_datetime_input,
)

NEW_COMMIT_MESSAGE = "New commit"
FIRST_COMMIT = CommitInfo(1)
NEW_COMMIT = CommitInfo(2, NEW_COMMIT_MESSAGE)


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db()
    page.goto("/")
    page.get_by_test_id("edit-button").click()


def test_refuses_to_commit_with_no_message(page: Page) -> None:
    """Refuses to make a commit if there is no message."""
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    # Attempt to make a commit
    page.get_by_test_id("open-commit-dialog-button").click()
    page.get_by_test_id("make-commit-button").click()

    # Message field exists and is enabled, meaning a commit was not made
    expect(commit_message_input).to_be_enabled()


def test_reopen_resets_commit_message(page: Page) -> None:
    """Commit message resets when the commit dialog is reopened."""
    open_commit_dialog_button = page.get_by_test_id("open-commit-dialog-button")
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    # Open commit dialog and type a new commit
    open_commit_dialog_button.click()
    commit_message_input.fill(NEW_COMMIT_MESSAGE)
    expect(commit_message_input).to_have_value(NEW_COMMIT_MESSAGE)

    # Close commit dialog
    page.get_by_test_id("close-commit-dialog-button").click()

    # When commit dialog is reopened, commit message is empty
    open_commit_dialog_button.click()
    expect(commit_message_input).to_have_value("")


# pylint: disable-next=too-many-locals
def test_make_commit(page: Page) -> None:
    """Can edit data and make a commit."""
    commit_select_combobox = page.get_by_test_id("commit-select-combobox")
    commit_select_combobox_input = commit_select_combobox.get_by_role("combobox")
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    int_item = page.get_by_test_id("parameter-list-item-int")
    int_item_input = int_item.get_by_test_id("leaf-input").get_by_role("textbox")
    int_old_item = page.get_by_test_id("comparison-list-item-old-int")
    int_new_item = page.get_by_test_id("comparison-list-item-new-int")

    float_item = page.get_by_test_id("parameter-list-item-float")
    float_item_input = float_item.get_by_test_id("leaf-input").get_by_role("textbox")
    float_old_item = page.get_by_test_id("comparison-list-item-old-float")
    float_new_item = page.get_by_test_id("comparison-list-item-new-float")

    str_item = page.get_by_test_id("parameter-list-item-str")
    str_item_input = str_item.get_by_test_id("leaf-input").get_by_role("textbox")
    str_old_item = page.get_by_test_id("comparison-list-item-old-str")
    str_new_item = page.get_by_test_id("comparison-list-item-new-str")

    # Initial values
    expect(int_item_input).to_have_value("123")
    expect(float_item_input).to_have_value("1.2345")
    expect(str_item_input).to_have_value("test")

    # Edit parameter values
    int_item_input.fill("456")
    float_item_input.fill("5.6789")

    # Opem commit dialog
    page.get_by_test_id("open-commit-dialog-button").click()

    # Commit list reflects what was changed
    expect(page.get_by_test_id("commit-changes-message")).to_have_text(
        f"Changes from latest commit ({FIRST_COMMIT.message})"
    )
    expect(int_old_item).to_have_text("int123")
    expect(int_new_item).to_have_text("int456")
    expect(float_old_item).to_have_text("float1.2345")
    expect(float_new_item).to_have_text("float5.6789")
    expect(str_old_item).not_to_be_attached()
    expect(str_new_item).not_to_be_attached()

    # Enter message and make commit
    commit_message_input.fill(NEW_COMMIT_MESSAGE)
    commit_message_input.press("Enter")
    expect(commit_select_combobox_input).to_have_value(NEW_COMMIT.message)

    # Values were updated
    expect(int_item).to_have_text("int456")
    expect(float_item).to_have_text("float5.679")
    expect(str_item).to_have_text("strtest")


def test_commit_backend_format(page: Page) -> None:
    """
    Commits to the backend in the correct format for datetime and Quantity and (i.e. the
    format that allows them to be read by Python).
    """
    commit_message = page.get_by_test_id("commit-message-text-field")
    commit_message_input = commit_message.get_by_role("textbox")

    datetime_item = page.get_by_test_id("parameter-list-item-datetime")
    datetime_item_input = datetime_item.get_by_test_id("leaf-input").locator(
        "input[type=datetime-local]"
    )
    quantity_item = page.get_by_test_id("parameter-list-item-Quantity")
    quantity_item_input = quantity_item.get_by_test_id("leaf-input").get_by_role(
        "textbox"
    )
    quantity_item_unit_input = quantity_item.get_by_test_id(
        "leaf-unit-input"
    ).get_by_role("textbox")

    # Update datetime and quantity
    datetime_item_input.fill(get_datetime_input(2))
    quantity_item_input.fill("5.6789")
    quantity_item_unit_input.fill("GHz")

    # Make commit
    page.get_by_test_id("open-commit-dialog-button").click()
    commit_message_input.fill(NEW_COMMIT_MESSAGE)
    commit_message_input.press("Enter")

    # Load classes in the backend (test fails if this fails)
    load_classes_from_db()
