"""Tests for parameter editing."""

from __future__ import annotations
import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import get_date


@pytest.fixture(autouse=True)
def setup(_reset_single_db: None, _visit_page: None, page: Page) -> None:
    """Automatically run before each test in this module."""
    page.get_by_test_id("edit-button").click()


def test_displays_input_int(page: Page) -> None:
    """Displays correct input for int parameters."""
    item = page.get_by_test_id("parameter-list-item-int")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("123")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")


def test_displays_input_float(page: Page) -> None:
    """Displays correct input for float parameters."""
    item = page.get_by_test_id("parameter-list-item-float")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("1.2345")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("int/float")


def test_displays_input_bool(page: Page) -> None:
    """Displays correct input for bool parameters."""
    item = page.get_by_test_id("parameter-list-item-bool")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("combobox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_text("True")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("bool")


def test_displays_input_str(page: Page) -> None:
    """Displays correct input for str parameters."""
    item = page.get_by_test_id("parameter-list-item-str")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("test")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("str")


def test_displays_input_none(page: Page) -> None:
    """Displays correct input for None parameters."""
    item = page.get_by_test_id("parameter-list-item-None")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("None")
    expect(leaf_input).to_be_disabled()
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("None")


def test_displays_input_datetime(page: Page) -> None:
    """Displays correct input for datetime parameters."""
    datetime_input_value = get_date(1).astimezone().strftime("%Y-%m-%dT%H:%M")
    item = page.get_by_test_id("parameter-list-item-datetime")
    leaf_input = item.get_by_test_id("leaf-input").locator("input[type=datetime-local]")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value(datetime_input_value)
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("datetime")


def test_displays_input_quantity(page: Page) -> None:
    """Displays correct input for Quantity parameters."""
    item = page.get_by_test_id("parameter-list-item-Quantity")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_unit_input = item.get_by_test_id("leaf-unit-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_unit_input).to_have_value("m")
    expect(leaf_type_input).to_have_text("Quantity")


def test_can_edit_input_int(page: Page) -> None:
    """Input for int parameters can be edited and reset."""
    item = page.get_by_test_id("parameter-list-item-int")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    reset_button = item.get_by_test_id("reset-leaf-button")

    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    leaf_input.fill("123a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")
    reset_button.click()
    expect(leaf_input).to_have_value("123")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
