"""Database wrapper used for backend API."""

from typing import Any
from paramdb import ParamDB


class DB:
    """Database wrapper for a ParamDB database."""

    def __init__(self, path: str):
        self._path = path
        self._db = ParamDB[Any](path)

    @property
    def name(self):
        """Name of the database."""
        return self._path
