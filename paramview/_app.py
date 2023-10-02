"""WSGI app to serve the frontend and the backend API."""

from __future__ import annotations
from typing import Any
import os
from werkzeug.exceptions import NotFound
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
    def index() -> Response | str:
        """Serve index.html."""
        static_folder = app.static_folder
        assert static_folder is not None, "no static folder set"
        try:
            return send_from_directory(static_folder, "index.html")
        except NotFound:
            index_html_path = os.path.join(static_folder, "index.html")
            github_link = "https://github.com/PainterQubits/paramview"
            return f"""
<h1>Frontend is not compiled</h1>
<p>File <code>{index_html_path}</code> was not found.</p>
<p>
  This page has a 200 code (OK) instead of a 404 code (Not Found) to make it easier to
  check if the backend is running during end-to-end testing.
</p>
<p>See <a href="{github_link}">{github_link}</a> for more information.</p>
"""

    return app, socketio
