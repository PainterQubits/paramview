"""Tests for parameter editing."""

from __future__ import annotations
import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import DB_NAME, clear_db


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    clear_db()
    page.goto("/")


def test_error_title(page: Page) -> None:
    """Page title is "Error"."""
    expect(page).to_have_title("Error")


def test_error_alert(page: Page) -> None:
    """Displays an alert with the error message."""
    alert_title = page.get_by_test_id("alert-title")
    error_message = page.get_by_test_id("error-message")
    reload_button = page.get_by_test_id("reload-button")

    expect(alert_title).to_have_text("Error")
    expect(error_message).to_have_text(f"Database {DB_NAME} has no commits.")
    expect(reload_button).to_have_text("Reload")


def test_reload_button(page: Page) -> None:
    """Page reloads with the reload button is clicked."""
    page.get_by_test_id("reload-button").click()
    last_navigation_type = page.evaluate_handle(
        "window.performance.getEntriesByType('navigation')[0].type"
    )
    assert last_navigation_type.json_value() == "reload"
