"""WSGI app."""

from pathlib import Path
from flask import Flask, send_from_directory
from paramview._api import api


def create_app(db_path: Path):
    """Return the WSGI app for ParamView with the given database path."""
    app = Flask(__name__, static_url_path="/")
    app.config["db_path"] = db_path
    app.register_blueprint(api)

    @app.route("/")
    def index():
        """Serve index.html."""
        return send_from_directory(app.static_folder, "index.html")

    return app
