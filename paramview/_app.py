"""WSGI app."""

from typing import Any
import os
import eventlet  # type: ignore
from flask import Flask, Response, send_from_directory
from flask_socketio import SocketIO  # type: ignore
from paramdb import ParamDB
from paramview._api import api

# Monkey patch the socket library for Redis
eventlet.monkey_patch(socket=True)


def create_app(db_path: str) -> tuple[Flask, SocketIO]:
    """Return the WSGI app for ParamView with the given database path."""
    if not os.path.exists(db_path):
        raise FileNotFoundError(f"database file '{db_path}' does not exist")
    app = Flask(__name__, static_url_path="/")
    app.config["db_path"] = db_path
    app.config["db"] = ParamDB[Any](db_path)
    app.register_blueprint(api)
    socketio = SocketIO(app, message_queue="memory:///")

    @app.route("/")
    def index() -> Response:
        """Serve index.html."""
        static_folder = app.static_folder
        assert static_folder is not None, "no static folder set"
        return send_from_directory(static_folder, "index.html")

    return app, socketio
