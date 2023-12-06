"""Flask blueprint for the backend API."""

from __future__ import annotations
import os
import traceback
from typing import Any, cast
from werkzeug.exceptions import HTTPException
from flask import Blueprint, Response, jsonify, has_app_context, current_app, request
from paramdb import ParamDB, CommitEntry

api = Blueprint("api", __name__, url_prefix="/api")
"""Flask blueprint for the backend API."""


# pylint: disable-next=too-few-public-methods
class _CurrentDB:
    """Wrapper to get properties from the database for the current Flask app."""

    def __getattribute__(self, name: str) -> Any:
        # Get attributes from the current Flask app's database, if available
        if has_app_context():
            db: ParamDB[Any] = current_app.config["db"]
            return getattr(db, name)
        return super().__getattribute__(name)


_current_db = cast(ParamDB[Any], _CurrentDB())
"""Database for the current Flask app."""


@api.errorhandler(HTTPException)
def _exception(exc: HTTPException) -> tuple[dict[str, Any], int]:
    """Return HTTP exception information as JSON."""
    return (
        {"code": exc.code, "name": exc.name, "description": traceback.format_exc()},
        exc.code or 500,
    )


@api.get("/database-name")
def _database_name() -> Response:
    """Return the database name."""
    db_path = cast(str, current_app.config["db_path"])
    return jsonify(os.path.basename(db_path))


@api.get("/commit-history")
def _commit_history() -> list[CommitEntry]:
    """Return the commit history."""
    commit_history = _current_db.commit_history()
    return commit_history


@api.get("/data/<int:commit_id>")
def _params(commit_id: int) -> Response:
    """Return data from the commit with the given ID."""
    # ParamDB custom classes and Astropy are not required since load_classes is False
    return jsonify(_current_db.load(commit_id, load_classes=False))


@api.post("/commit")
def _commit() -> Response:
    """
    Create a commit with the given message and data. This request gets its data from the
    JSON body of a POST request.
    """
    request_data = request.json
    if not isinstance(request_data, dict):
        raise TypeError(
            f"request body must be a dictionary, not '{type(request_data).__name__}'"
        )
    try:
        message = request_data["message"]
        data = request_data["data"]
    except KeyError as exc:
        raise ValueError(
            "request body must contain the keys 'message' and 'data'"
        ) from exc
    if not isinstance(message, str):
        raise TypeError(f"message must be a string, not '{type(message).__name__}'")
    return jsonify(_current_db.commit(message, data))
