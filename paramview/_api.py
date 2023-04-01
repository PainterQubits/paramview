"""Flask blueprint for the backend API."""

from flask import Blueprint, current_app
from paramview._db import DB

api = Blueprint("api", __name__, url_prefix="/api")


def get_db() -> DB:
    """Get the database for the current app."""
    return current_app.config["db"]


@api.route("/database-name")
def database_name() -> str:
    """Return the commit history."""
    return get_db().name
