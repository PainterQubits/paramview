"""Flask blueprint for the backend API."""

import os
from typing import Any, cast
from flask import Blueprint, Response, current_app, jsonify
from paramdb import ParamDB, CommitEntry

api = Blueprint("api", __name__, url_prefix="/api")


class _CurrentDB:
    """Wrapper to get properties from the database for the current app."""

    def __getattribute__(self, name: str) -> Any:
        db: ParamDB[Any] = current_app.config["db"]
        return getattr(db, name)


# Database for the current app
_current_db = cast(ParamDB[Any], _CurrentDB())


@api.route("/database-name")
def _database_name() -> Response:
    """Return the database name."""
    current_db_path: str = current_app.config["db_path"]
    return jsonify(os.path.basename(current_db_path))


@api.route("/commit-history")
def _commit_history() -> list[CommitEntry]:
    """Return the commit history."""
    return _current_db.commit_history()
