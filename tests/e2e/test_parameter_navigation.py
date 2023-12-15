"""Tests for parameter navigation."""

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
