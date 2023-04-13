"""Tests for the backend API."""

from typing import Any
from flask import json
from flask.testing import FlaskClient
from paramdb import ParamDB


def test_database_name(db_name: str, client: FlaskClient) -> None:
    """Gets the database name."""
    response = client.get("/api/database-name")
    assert response.status_code == 200  # Success
    assert response.mimetype == "application/json"
    assert response.json == db_name


def test_commit_history(db: ParamDB[Any], client: FlaskClient) -> None:
    """Gets the database name."""
    response = client.get("/api/commit-history")
    assert response.status_code == 200  # Success
    assert response.mimetype == "application/json"
    assert response.json == json.loads(json.dumps(db.commit_history()))


def test_data_nonexistent_fails(client: FlaskClient) -> None:
    """Fails to get data from a nonexistent commit."""
    response = client.get("/api/data/0")
    assert response.status_code == 500  # Server error
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 500
    assert error_json["name"] == "Internal Server Error"
    assert "IndexError" in error_json["description"]


def test_data(db: ParamDB[Any], client: FlaskClient) -> None:
    """Gets data from particular commits."""
    for entry in db.commit_history():
        response = client.get(f"/api/data/{entry.id}")
        assert response.status_code == 200  # Success
        assert response.mimetype == "application/json"
        assert response.json == db.load(entry.id, load_classes=False)
