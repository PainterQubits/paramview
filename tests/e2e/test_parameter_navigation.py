"""Tests for parameter navigation."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import get_date, datetime_to_display_str

DATE_DISPLAY_STR = datetime_to_display_str(get_date(1))


@pytest.fixture(autouse=True)
def setup(_reset_single_db: None, _visit_page: None) -> None:
    """Automatically run before each test in this module."""


@pytest.mark.parametrize(
    "test_id,expected_text",
    [
        ("parameter-list-item-int", "int123"),
        ("parameter-list-item-float", "float1.234"),  # Rounded
        ("parameter-list-item-bool", "boolTrue"),
        ("parameter-list-item-str", "strtest"),
        ("parameter-list-item-None", "NoneNone"),
        ("parameter-list-item-datetime", f"datetime{DATE_DISPLAY_STR}"),
        ("parameter-list-item-Quantity", "Quantity1.234 m"),  # Rounded
        ("parameter-list-item-list", "listlist"),
        ("parameter-list-item-dict", "dictdict"),
        ("parameter-list-item-paramList", "paramListParamList"),
        ("parameter-list-item-paramDict", "paramDictParamDict"),
        (
            "parameter-list-item-struct",
            f"structCustomStruct (Struct){DATE_DISPLAY_STR}",
        ),
        (
            "parameter-list-item-param",
            f"paramCustomParam (Param){DATE_DISPLAY_STR}",
        ),
    ],
)
def test_displays_param(page: Page, test_id: str, expected_text: str) -> None:
    """Displays each type of parameter."""
    expect(page.get_by_test_id(test_id)).to_have_text(expected_text)
