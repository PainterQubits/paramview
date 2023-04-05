"""Flask blueprint for the backend API."""

import os
import traceback
from typing import Any, cast
from werkzeug.exceptions import HTTPException
from flask import Blueprint, Response, jsonify, current_app
from paramdb import ParamDB, CommitEntry

api = Blueprint("api", __name__, url_prefix="/api")


class _CurrentDB:
    """Wrapper to get properties from the database for the current app."""

    def __getattribute__(self, name: str) -> Any:
        db: ParamDB[Any] = current_app.config["db"]
        return getattr(db, name)


# Database for the current app
_current_db = cast(ParamDB[Any], _CurrentDB())


@api.errorhandler(HTTPException)
def _exception(exc: HTTPException) -> tuple[dict[str, Any], int]:
    return (
        {"code": exc.code, "name": exc.name, "description": traceback.format_exc()},
        exc.code or 500,
    )


@api.route("/database-name")
def _database_name() -> Response:
    """Return the database name."""
    current_db_path: str = current_app.config["db_path"]
    return jsonify(os.path.basename(current_db_path))


@api.route("/commit-history")
def _commit_history() -> list[CommitEntry]:
    """Return the commit history."""
    return _current_db.commit_history()


@api.route("/data/<int:commit_id>")
def _params(commit_id: int) -> dict[str, Any]:
    """Return data from the commit with the given ID."""
    return _current_db.load(commit_id, load_classes=False)
