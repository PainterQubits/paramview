"""Tests for parameter editing."""

from __future__ import annotations
import pytest
from playwright.sync_api import Page, Dialog, expect
from tests.e2e.helpers import reset_db, get_datetime_input


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db()
    page.goto("/")
    page.get_by_test_id("edit-button").click()


def test_input_int(page: Page) -> None:
    """
    Input for int parameters has the correct initial values can be edited and reset, and
    is properly validated.
    """
    item = page.get_by_test_id("parameter-list-item-int")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("123")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")

    # Fill with invalid input
    leaf_input.fill("123a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("123")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")


def test_input_float(page: Page) -> None:
    """
    Input for float parameters has the correct initial values can be edited and reset,
    and is properly validated.
    """
    item = page.get_by_test_id("parameter-list-item-float")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")

    # Fill with invalid input
    leaf_input.fill("1.2345a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")


def test_input_bool(page: Page) -> None:
    """
    Input for bool parameters has the correct initial values can be edited and reset.
    """
    item = page.get_by_test_id("parameter-list-item-bool")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("combobox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_text("True")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("bool")

    # Change value to False
    leaf_input.click()
    page.get_by_test_id("bool-input-option-False").click()
    expect(leaf_input).to_have_text("False")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_text("True")


def test_input_str(page: Page) -> None:
    """
    Input for str parameters has the correct initial values can be edited and reset.
    """
    item = page.get_by_test_id("parameter-list-item-str")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("test")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("str")

    # Change value
    leaf_input.fill("testa")
    expect(leaf_input).to_have_value("testa")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("test")


def test_input_none(page: Page) -> None:
    """
    Input for None parameters has the correct initial values can be edited and reset.
    """
    item = page.get_by_test_id("parameter-list-item-None")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("None")
    expect(leaf_input).to_be_disabled()
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("None")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("None")
    expect(leaf_input).to_be_disabled()


def test_input_datetime(page: Page) -> None:
    """
    Input for datetime parameters has the correct initial values can be edited and
    reset.
    """
    datetime_input_value = get_datetime_input(1)
    new_datetime_input_value = get_datetime_input(2)
    item = page.get_by_test_id("parameter-list-item-datetime")
    leaf_input = item.get_by_test_id("leaf-input").locator("input[type=datetime-local]")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value(datetime_input_value)
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("datetime")

    # Change value
    leaf_input.fill(new_datetime_input_value)
    expect(leaf_input).to_have_value(new_datetime_input_value)

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value(datetime_input_value)


def test_input_quantity(page: Page) -> None:
    """
    Input for Quantity parameters has the correct initial values can be edited and
    reset.
    """
    item = page.get_by_test_id("parameter-list-item-Quantity")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_unit_input = item.get_by_test_id("leaf-unit-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    expect(leaf_unit_input).to_have_value("m")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "false")
    expect(leaf_type_input).to_have_text("Quantity")

    # Fill number with invalid input
    leaf_input.fill("1.2345a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")

    # Fill units with valid input
    leaf_unit_input.fill("ms")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "false")

    # Fill units with invalid input
    leaf_unit_input.fill("")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "true")

    # Reset
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    expect(leaf_unit_input).to_have_value("m")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "false")


def test_change_input_type(page: Page) -> None:
    """Can change an input to each parameter type."""
    item = page.get_by_test_id("parameter-list-item-int")
    leaf_input = item.get_by_test_id("leaf-input")
    leaf_input_textbox = leaf_input.get_by_role("textbox")
    leaf_input_combobox = leaf_input.get_by_role("combobox")
    leaf_input_datetime = leaf_input.locator("input[type=datetime-local]")
    leaf_unit_input = item.get_by_test_id("leaf-unit-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    # Select int/float type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-int-float").click()
    expect(leaf_input_textbox).to_have_value("123")
    expect(leaf_input_textbox).to_have_attribute("aria-invalid", "false")
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")

    # Select bool type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-bool").click()
    expect(leaf_input_combobox).to_have_text("False")
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("bool")

    # Select str type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-str").click()
    expect(leaf_input_textbox).to_have_value("False")
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("str")

    # Select None type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-None").click()
    expect(leaf_input_textbox).to_have_value("None")
    expect(leaf_input_textbox).to_be_disabled()
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("None")

    # Select datetime type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-datetime").click()
    expect(leaf_input_datetime).to_have_value("")
    expect(leaf_input_datetime).to_have_attribute("aria-invalid", "true")
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("datetime")

    # Select Quantity type
    leaf_type_input.click()
    page.get_by_test_id("leaf-type-option-Quantity").click()
    expect(leaf_input_textbox).to_have_value("None")
    expect(leaf_input_textbox).to_have_attribute("aria-invalid", "true")
    expect(leaf_unit_input).to_have_value("")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "true")
    expect(leaf_type_input).to_have_text("Quantity")

    # Reset to original type
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input_textbox).to_have_value("123")
    expect(leaf_input_textbox).to_have_attribute("aria-invalid", "false")
    expect(leaf_unit_input).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")


def test_exit_edit_mode_no_changes(page: Page) -> None:
    """
    Can exit edit mode or close the page when there are no changes, and there are no
    dialogs.
    """
    no_dialogs = True
    edit_button = page.get_by_test_id("edit-button")
    cancel_button = page.get_by_test_id("cancel-edit-button")

    def handle_dialog(dialog: Dialog) -> None:
        nonlocal no_dialogs
        no_dialogs = False
        dialog.dismiss()

    page.on("dialog", handle_dialog)

    # Exit edit mode
    expect(edit_button).not_to_be_attached()
    expect(cancel_button).to_be_attached()
    cancel_button.click()
    expect(edit_button).to_be_attached()
    expect(cancel_button).not_to_be_attached()

    # Close the page
    page.close(run_before_unload=True)

    assert no_dialogs


def test_exit_edit_mode_invalid_changes(page: Page) -> None:
    """
    Can exit edit mode or close the page when there are invalid changes only, and there
    are no dialogs.
    """
    no_dialogs = True
    edit_button = page.get_by_test_id("edit-button")
    cancel_button = page.get_by_test_id("cancel-edit-button")
    leaf_input = (
        page.get_by_test_id("parameter-list-item-int")
        .get_by_test_id("leaf-input")
        .get_by_role("textbox")
    )

    def handle_dialog(dialog: Dialog) -> None:
        nonlocal no_dialogs
        no_dialogs = False
        dialog.dismiss()

    page.on("dialog", handle_dialog)

    # Fill with invalid value, then exit and re-enter edit mode
    leaf_input.fill("123a")
    cancel_button.click()
    edit_button.click()
    expect(leaf_input).to_have_value("123")

    # Fill with invalid value and close the page
    leaf_input.fill("123a")
    page.close(run_before_unload=True)

    assert no_dialogs


def test_exit_edit_mode_valid_changes_dismiss(page: Page) -> None:
    """
    When there are valid changes and exit mode is exited or the page is closed, the user
    is given a confirmation dialog. If they dismiss this dialog, exit mode is not
    exited.
    """
    num_confirm_dialogs = 0
    dialog_message = None
    cancel_button = page.get_by_test_id("cancel-edit-button")
    leaf_input = (
        page.get_by_test_id("parameter-list-item-int")
        .get_by_test_id("leaf-input")
        .get_by_role("textbox")
    )

    def handle_dialog(dialog: Dialog) -> None:
        nonlocal num_confirm_dialogs, dialog_message
        num_confirm_dialogs += 1
        dialog_message = dialog.message
        dialog.dismiss()

    page.on("dialog", handle_dialog)

    # Fill with valid value and attempt to exit edit mode
    leaf_input.fill("1234")
    cancel_button.click()
    expect(leaf_input).to_have_value("1234")
    assert num_confirm_dialogs == 1
    assert dialog_message == "You have unsaved changes. Do you want to discard them?"

    # Change to invalid value and attempt to close the page
    leaf_input.fill("1234")
    page.close(run_before_unload=True)
    expect(leaf_input).to_have_value("1234")
    assert num_confirm_dialogs == 2


def test_exit_edit_mode_valid_changes_accept(page: Page) -> None:
    """
    When there are valid changes and exit mode is exited, the user is given a
    confirmation dialog. If they accept this dialog, exit mode is exited.
    """
    num_confirm_dialogs = 0
    dialog_message = None
    edit_button = page.get_by_test_id("edit-button")
    cancel_button = page.get_by_test_id("cancel-edit-button")
    leaf_input = (
        page.get_by_test_id("parameter-list-item-int")
        .get_by_test_id("leaf-input")
        .get_by_role("textbox")
    )

    def handle_dialog(dialog: Dialog) -> None:
        nonlocal num_confirm_dialogs, dialog_message
        num_confirm_dialogs += 1
        dialog_message = dialog.message
        dialog.accept()

    page.on("dialog", handle_dialog)

    # Fill with valid value and exit edit mode
    leaf_input.fill("1234")
    cancel_button.click()
    edit_button.click()
    expect(leaf_input).to_have_value("123")
    assert num_confirm_dialogs == 1
    assert dialog_message == "You have unsaved changes. Do you want to discard them?"
