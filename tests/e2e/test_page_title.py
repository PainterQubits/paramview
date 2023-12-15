"""Tests for the page title."""

from playwright.sync_api import Page, expect
from tests.e2e.helpers import DB_NAME, clear_db, reset_db


def test_title(page: Page) -> None:
    """Page title is the database file name, or "Error" if an error occurs."""
    reset_db()
    page.goto("/")
    expect(page).to_have_title(DB_NAME)
    clear_db()
    expect(page).to_have_title("Error")
