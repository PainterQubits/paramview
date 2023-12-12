"""
Global fixtures for unit tests.

Called automatically by Pytest before running tests.
"""

from __future__ import annotations
from typing import Any
import os
from pathlib import Path
from flask.testing import FlaskClient
from flask_socketio import SocketIOTestClient  # type: ignore
import pytest
from paramdb import ParamList, ParamDict, ParamDB
from paramview._app import create_app


@pytest.fixture(name="db_name")
def fixture_db_name() -> str:
    """Database file name."""
    return "param.db"


@pytest.fixture(name="db_path")
def fixture_db_path(tmp_path: Path, db_name: str) -> str:
    """
    Path to a ParamDB database. The initial database is created using a different path
    name to ensure that residual file system events do not trigger update events when
    testing watch_db.
    """
    db_path = str(tmp_path / db_name)
    db_path_init = f"{db_path}-init"
    db = ParamDB[Any](db_path_init)

    # Keys b, a, c are purposely unsorted to ensure that Flask does not sort them in
    # JSON responses
    db.commit("Initial commit", ParamDict(b=1, a=2, c=3))
    db.commit("Increment all by 3", ParamDict(b=4, a=5, c=6))
    db.commit("Convert to list", ParamList([4, 5, 6]))
    db.dispose()  # Explicitly close DB to avoid Windows permission error
    os.rename(db_path_init, db_path)
    return db_path


@pytest.fixture(name="db")
def fixture_db(db_path: str) -> ParamDB[Any]:
    """ParamDB database."""
    return ParamDB[Any](db_path)


@pytest.fixture(name="clients")
def fixture_clients(db_path: str) -> tuple[FlaskClient, SocketIOTestClient]:
    """Test clients for the Flask app and SocketIO instance."""
    app, socketio = create_app(db_path)
    client = app.test_client()
    socketio_client = socketio.test_client(app)
    return client, socketio_client


@pytest.fixture(name="client")
def fixture_client(clients: tuple[FlaskClient, SocketIOTestClient]) -> FlaskClient:
    """Test client for the Flask app."""
    return clients[0]


@pytest.fixture(name="socketio_client")
def fixture_socketio_client(
    clients: tuple[FlaskClient, SocketIOTestClient]
) -> SocketIOTestClient:
    """Test client for the SocketIO instance."""
    return clients[1]
