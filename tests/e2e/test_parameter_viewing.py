"""Tests for parameter viewing."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import reset_db, get_datetime_display

INITIAL_DATETIME_DISPLAY = get_datetime_display(1)


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db()
    page.goto("/")


def test_displays_params(page: Page) -> None:
    """Displays each type of parameter."""
    for test_id, expected_text in [
        ("parameter-list-item-int", "int123"),
        ("parameter-list-item-float", "float1.234"),  # Rounded
        ("parameter-list-item-bool", "boolTrue"),
        ("parameter-list-item-str", "strtest"),
        ("parameter-list-item-None", "NoneNone"),
        ("parameter-list-item-datetime", f"datetime{INITIAL_DATETIME_DISPLAY}"),
        ("parameter-list-item-Quantity", "Quantity1.234 m"),  # Rounded
        ("parameter-list-item-list", "listlist"),
        ("parameter-list-item-dict", "dictdict"),
        ("parameter-list-item-paramList", "paramListParamList"),
        ("parameter-list-item-paramDict", "paramDictParamDict"),
        (
            "parameter-list-item-struct",
            f"structCustomStruct (Struct){INITIAL_DATETIME_DISPLAY}",
        ),
        (
            "parameter-list-item-param",
            f"paramCustomParam (Param){INITIAL_DATETIME_DISPLAY}",
        ),
    ]:
        expect(page.get_by_test_id(test_id)).to_have_text(expected_text)


def test_round_switch(page: Page) -> None:
    """Rounds numerical parameters only when round switch is checked."""
    round_switch = page.get_by_test_id("round-switch")
    float_item = page.get_by_test_id("parameter-list-item-float")
    quantity_item = page.get_by_test_id("parameter-list-item-Quantity")

    # Rounded (default)
    expect(round_switch).to_be_checked()
    expect(float_item).to_have_text("float1.234")
    expect(quantity_item).to_have_text("Quantity1.234 m")

    # Unrounded
    round_switch.uncheck()
    expect(round_switch).not_to_be_checked()
    expect(float_item).to_have_text("float1.2345")
    expect(quantity_item).to_have_text("Quantity1.2345 m")


def test_nested_items(page: Page) -> None:
    """Expands and collapses nested items when they are clicked."""
    nested_item = page.get_by_test_id("parameter-list-item-dict")
    nested_item_button = nested_item.get_by_role("button")
    child_item_1 = nested_item.get_by_test_id("parameter-list-item-int")
    child_item_2 = nested_item.get_by_test_id("parameter-list-item-str")

    # Initially collapsed
    expect(child_item_1).not_to_be_visible()
    expect(child_item_2).not_to_be_visible()

    # Expands when clicked
    nested_item_button.click()
    expect(child_item_1).to_be_visible()
    expect(child_item_2).to_be_visible()

    # Collapses when clicked again
    nested_item_button.click()
    expect(child_item_1).not_to_be_visible()
    expect(child_item_2).not_to_be_visible()


def test_collapse_all(page: Page) -> None:
    """Collapses all non-root items when "Collapse all" is clicked."""
    dict_item = page.get_by_test_id("parameter-list-item-dict")
    list_item = page.get_by_test_id("parameter-list-item-list")
    dict_item_child_1 = dict_item.get_by_test_id("parameter-list-item-int")
    dict_item_child_2 = dict_item.get_by_test_id("parameter-list-item-str")
    list_item_child_1 = list_item.get_by_test_id("parameter-list-item-0")
    list_item_child_2 = list_item.get_by_test_id("parameter-list-item-1")

    # Click nested items to expand
    dict_item.get_by_role("button").click()
    list_item.get_by_role("button").click()
    expect(dict_item_child_1).to_be_visible()
    expect(dict_item_child_2).to_be_visible()
    expect(list_item_child_1).to_be_visible()
    expect(list_item_child_2).to_be_visible()

    # Collapse all
    page.get_by_test_id("collapse-all-button").click()
    expect(dict_item_child_1).not_to_be_visible()
    expect(dict_item_child_2).not_to_be_visible()
    expect(list_item_child_1).not_to_be_visible()
    expect(list_item_child_2).not_to_be_visible()


def test_collapse_all_root(page: Page) -> None:
    """Expands the root item when "Collapse all" is clicked."""
    root_item = page.get_by_test_id("parameter-list-item-root")
    child_item_1 = root_item.get_by_test_id("parameter-list-item-int")
    child_item_2 = root_item.get_by_test_id("parameter-list-item-str")

    # Click root to collapse
    root_item.get_by_role("button", name="root").click()
    expect(child_item_1).not_to_be_visible()
    expect(child_item_2).not_to_be_visible()

    # Collapse all to reset root
    page.get_by_test_id("collapse-all-button").click()
    expect(child_item_1).to_be_visible()
    expect(child_item_2).to_be_visible()
