"""Tests for parameter editing."""

from __future__ import annotations
import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import get_date, datetime_to_input_str


@pytest.fixture(autouse=True)
def setup(_reset_single_db: None, _visit_page: None, page: Page) -> None:
    """Automatically run before each test in this module."""
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

    leaf_input.fill("123a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("123")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")


def test_displays_input_float(page: Page) -> None:
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

    leaf_input.fill("1.2345a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")


def test_displays_input_bool(page: Page) -> None:
    """
    Input for bool parameters has the correct initial values can be edited and reset.
    """
    item = page.get_by_test_id("parameter-list-item-bool")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("combobox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_text("True")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("bool")

    leaf_input.click()
    page.get_by_test_id("bool-input-option-False").click()
    expect(leaf_input).to_have_text("False")
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_text("True")


def test_displays_input_str(page: Page) -> None:
    """
    Input for str parameters has the correct initial values can be edited and reset.
    """
    item = page.get_by_test_id("parameter-list-item-str")
    leaf_input = item.get_by_test_id("leaf-input").get_by_role("textbox")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value("test")
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("str")

    leaf_input.fill("testa")
    expect(leaf_input).to_have_value("testa")
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("test")


def test_displays_input_none(page: Page) -> None:
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

    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("None")
    expect(leaf_input).to_be_disabled()


def test_displays_input_datetime(page: Page) -> None:
    """
    Input for datetime parameters has the correct initial values can be edited and
    reset.
    """
    datetime_input_value = datetime_to_input_str(get_date(1))
    new_datetime_input_value = datetime_to_input_str(get_date(2))
    item = page.get_by_test_id("parameter-list-item-datetime")
    leaf_input = item.get_by_test_id("leaf-input").locator("input[type=datetime-local]")
    leaf_type_input = item.get_by_test_id("leaf-type-input").get_by_role("combobox")

    expect(leaf_input).to_have_value(datetime_input_value)
    expect(item.get_by_test_id("leaf-unit-input")).not_to_be_attached()
    expect(leaf_type_input).to_have_text("datetime")

    leaf_input.fill(new_datetime_input_value)
    expect(leaf_input).to_have_value(new_datetime_input_value)
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value(datetime_input_value)


def test_displays_input_quantity(page: Page) -> None:
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

    leaf_input.fill("1.2345a")
    expect(leaf_input).to_have_attribute("aria-invalid", "true")
    leaf_unit_input.fill("ms")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "false")
    leaf_unit_input.fill("")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "true")
    item.get_by_test_id("reset-leaf-button").click()
    expect(leaf_input).to_have_value("1.2345")
    expect(leaf_input).to_have_attribute("aria-invalid", "false")
    expect(leaf_unit_input).to_have_value("m")
    expect(leaf_unit_input).to_have_attribute("aria-invalid", "false")
