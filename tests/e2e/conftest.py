"""
Global fixtures for E2E tests.

Called automatically by Pytest before running tests.
"""

from __future__ import annotations
import pytest
from playwright.sync_api import Page, Dialog
from tests.e2e.helpers import CaptureDialogs


@pytest.fixture(name="capture_dialogs")
def fixture_capture_dialogs(page: Page) -> CaptureDialogs:
    """Capture dialogs and expose a an object with settings and captured values."""
    capture_dialogs = CaptureDialogs()

    def handle_dialog(dialog: Dialog) -> None:
        capture_dialogs.num_dialogs += 1
        capture_dialogs.last_dialog_message = dialog.message
        if capture_dialogs.accept:
            dialog.accept()
        else:
            dialog.dismiss()

    page.on("dialog", handle_dialog)
    return capture_dialogs
