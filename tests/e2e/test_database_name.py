"""Tests for the page title."""

import pytest
from playwright.sync_api import Page, expect
from tests.e2e.helpers import DB_NAME, reset_db


@pytest.fixture(autouse=True)
def setup(page: Page) -> None:
    """Automatically run before each test in this module."""
    reset_db()
    page.goto("/")


def test_page_title(page: Page) -> None:
    """Page title is the database file name."""
    expect(page).to_have_title(DB_NAME)


def test_database_name(page: Page) -> None:
    """Database name header is the database file name."""
    expect(page.get_by_test_id("database-name")).to_have_text(DB_NAME)
