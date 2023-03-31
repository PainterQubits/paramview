"""WSGI app for ParamView."""

from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path="/")


@app.route("/")
def index():
    """Serve index.html."""
    return send_from_directory(app.static_folder, "index.html")
