"""Tests for parameter editing."""

from playwright.sync_api import Page, expect


def test_displays_inputs(_reset_single_db: None, page: Page) -> None:
    """Displays correct input for each parameter type."""
    page.goto("/")
    page.get_by_test_id("edit-button").click()
    expect(
        page.get_by_test_id("parameter-list-item-int")
        .get_by_test_id("leaf-input")
        .get_by_role("textbox")
    ).to_have_value("123")
