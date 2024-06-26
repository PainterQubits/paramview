"""Tests for the backend API."""

from __future__ import annotations
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
    assert response.status_code == 500  # Internal server error
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
        response_data = response.text
        loaded_data = db.load(entry.id, raw_json=True)
        assert response_data == loaded_data
        if isinstance(response_data, dict):
            # Check that key order is the same (i.e. Flask does not sort the keys)
            assert list(response_data) == list(loaded_data)


def test_commit_not_json_fails(client: FlaskClient) -> None:
    """Fails to create a commit if the mimetype is not JSON."""
    response = client.post("/api/commit", data="not JSON")
    assert response.status_code == 415  # Unsupported media type
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 415
    assert error_json["name"] == "Unsupported Media Type"
    assert "application/json" in error_json["description"]


def test_commit_not_dict_fails(client: FlaskClient) -> None:
    """Fails to create a commit if the response body is not a dictionary."""
    response = client.post("/api/commit", json="not a dict")
    assert response.status_code == 500  # Internal server error
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 500
    assert error_json["name"] == "Internal Server Error"
    assert (
        "TypeError: request body must be a dictionary, not 'str'"
        in error_json["description"]
    )


def test_commit_missing_key_fails(client: FlaskClient) -> None:
    """
    Fails to create a commit if the response body is missing the "message" or "data"
    key.
    """
    response = client.post("/api/commit", json={"message": "No data"})
    assert response.status_code == 500  # Internal server error
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 500
    assert error_json["name"] == "Internal Server Error"
    assert (
        "ValueError: request body must contain the keys 'message' and 'data'"
        in error_json["description"]
    )


def test_commit_message_not_str(client: FlaskClient) -> None:
    """Fails to create a commit if the message is not a string."""
    response = client.post("/api/commit", json={"message": {}, "data": ""})
    assert response.status_code == 500  # Internal server error
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 500
    assert error_json["name"] == "Internal Server Error"
    assert (
        "TypeError: message must be a string, not 'dict'" in error_json["description"]
    )


def test_commit_data_not_str(client: FlaskClient) -> None:
    """Fails to create a commit if the data is not a string."""
    response = client.post("/api/commit", json={"message": "", "data": {}})
    assert response.status_code == 500  # Internal server error
    assert response.mimetype == "application/json"
    error_json = response.json
    assert isinstance(error_json, dict)
    assert error_json["code"] == 500
    assert error_json["name"] == "Internal Server Error"
    assert "TypeError: data must be a string, not 'dict'" in error_json["description"]


def test_commit(db: ParamDB[Any], client: FlaskClient) -> None:
    """Creates a new commit in the database."""
    message = "Commit from API"
    data = json.loads(db.load(1, raw_json=True))
    data["data"]["data"]["a"]["data"] += 100  # Make data different
    data_str = json.dumps(data)
    response = client.post("/api/commit", json={"message": message, "data": data_str})
    assert response.status_code == 200  # Success
    assert response.mimetype == "application/json"
    commit_id = response.json
    assert isinstance(commit_id, int)
    loaded_message = db.commit_history()[-1].message
    loaded_data = db.load(commit_id, raw_json=True)
    assert loaded_message == message
    assert loaded_data == data_str
