"""Defines global fixtures. Called automatically by Pytest before running tests."""

from pathlib import Path
from flask.testing import FlaskClient
import pytest
from paramdb import ParamDict, ParamDB
from paramview._app import create_app


@pytest.fixture(name="db_name")
def fixture_db_name() -> str:
    """Database file name."""
    return "param.db"


@pytest.fixture(name="db_path")
def fixture_db_path(db_name: str, tmp_path: Path) -> str:
    """Path to a ParamDB database."""
    db_path = str(tmp_path / db_name)
    db = ParamDB[ParamDict[int]](db_path)
    db.commit("Initial commit", ParamDict(a=1, b=2, c=3))
    db.commit("Increment all by 3", ParamDict(a=4, b=5, c=6))
    db.commit("Increment all by 3 again", ParamDict(a=7, b=8, c=9))
    return db_path


@pytest.fixture(name="client")
def fixture_client(db_path: str) -> FlaskClient:
    """Test client for the Flask app."""
    app = create_app(db_path)
    return app.test_client()
