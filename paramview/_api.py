"""Flask blueprint for the backend API."""

from flask import Blueprint

api = Blueprint("api", __name__, url_prefix="/api")
