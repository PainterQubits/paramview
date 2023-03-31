"""Flask blueprint for the backend API."""

from flask import Blueprint, current_app

api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/database-name")
def database_name() -> str:
    """Return the commit history."""
    return current_app.config["db_path"].stem
