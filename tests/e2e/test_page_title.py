"""Tests for the page title."""

from playwright.sync_api import Page, expect


def test_title_is_db_name(_reset_db: None, page: Page, db_name: str) -> None:
    """Page title is the database file name."""
    page.goto("/")
    expect(page).to_have_title(db_name)


def test_title_is_error(_clear_db: None, page: Page) -> None:
    """Page title is "Error" if an error has occurred."""
    page.goto("/")
    expect(page).to_have_title("Error")
