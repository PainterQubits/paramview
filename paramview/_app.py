"""WSGI app to serve the frontend and the backend API."""

from typing import Any
import os
from flask import Flask, Response, send_from_directory
from flask.json.provider import DefaultJSONProvider
from flask_socketio import SocketIO  # type: ignore
from paramdb import ParamDB
from paramview._api import api


class _CustomJSONProvider(DefaultJSONProvider):
    """
    Flask's default JSON provider, with key sorting disabled. This means that the
    original key order will be preserved in responses.
    """

    sort_keys = False


class _CustomFlask(Flask):
    """Custom Flask class that includes our customized JSON provider."""

    json_provider_class = _CustomJSONProvider


def create_app(db_path: str) -> tuple[Flask, SocketIO]:
    """Return the WSGI app for ParamView with the given database path."""
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"database file '{db_path}' does not exist")
    app = _CustomFlask(__name__, static_url_path="/")
    app.config["db_path"] = db_path
    app.config["db"] = ParamDB[Any](db_path)
    app.register_blueprint(api)
    socketio = SocketIO(app)

    @app.route("/")
    def index() -> Response:
        """Serve index.html."""
        static_folder = app.static_folder
        assert static_folder is not None, "no static folder set"
        return send_from_directory(static_folder, "index.html")

    return app, socketio
