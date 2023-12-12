"""Tests for the WSGI app that serves the frontend."""

from __future__ import annotations
import os
from pathlib import Path
from flask.testing import FlaskClient
import pytest
from paramview._app import create_app


def test_nonexistent_db_fails(tmp_path: Path) -> None:
    """Fails to create app if there is no database at the given path."""
    nonexistent_db_path = str(tmp_path / "nonexistent.db")
    with pytest.raises(FileNotFoundError) as exc_info:
        create_app(nonexistent_db_path)
    assert (
        str(exc_info.value) == f"database file '{nonexistent_db_path}' does not exist"
    )


def test_index(client: FlaskClient) -> None:
    """
    Gets static/index.html from the root path. This test creates an index.html file if
    it does not exist.
    """
    static_dir = client.application.static_folder
    assert static_dir
    index_html_path = os.path.join(static_dir, "index.html")
    index_html_exists = os.path.exists(index_html_path)
    if not index_html_exists:
        os.makedirs(static_dir, exist_ok=True)
        with open(index_html_path, "w", encoding="utf-8") as f:
            f.write("")
    response = client.get("/")
    assert response.status_code == 200  # Success
    assert response.mimetype == "text/html"


def test_not_found(client: FlaskClient) -> None:
    """Returns a 404 response for a nonexistent path."""
    response = client.get("/notexistent")
    assert response.status_code == 404  # Success
    assert response.mimetype == "text/html"
