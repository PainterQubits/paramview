"""Tests for paramview._watch_db."""

from typing import Any, Generator, cast
import os
import time
from eventlet import sleep  # type: ignore
from flask_socketio import SocketIOTestClient  # type: ignore
import pytest
from paramdb import ParamDB
from paramview._watch_db import watch_db


def wait_for_socketio_events(socketio_client: SocketIOTestClient) -> list[Any]:
    """
    Wait for the given SocketIO client to recieve events, for a maximum of 1 second.
    """
    received: list[Any] = socketio_client.get_received()
    start = time.time()
    while len(received) == 0 and time.time() - start < 1:
        received = socketio_client.get_received()
        sleep(0.01)
    return received


@pytest.fixture(name="run_watch_db")
def fixture_run_watch_db(
    db_path: str, socketio_client: SocketIOTestClient
) -> Generator[None, None, None]:
    """Start the watch_db process and stop it when cleaning up."""
    stop_watch_db = watch_db(db_path, socketio_client.socketio)
    yield
    stop_watch_db()


def test_socketio_connected(socketio_client: SocketIOTestClient) -> None:
    """The server is connected to SocketIO."""
    assert socketio_client.is_connected()


def test_emits_on_update(
    db: ParamDB[Any],
    socketio_client: SocketIOTestClient,
    run_watch_db: None,  # pylint: disable=unused-argument
) -> None:
    """Emits a SocketIO event when the database is updated."""
    assert len(socketio_client.get_received()) == 0
    db.commit("", 123)
    received = wait_for_socketio_events(socketio_client)
    assert len(received) == 1
    assert received[0]["name"] == "database_update"


def test_emits_on_delete(
    db_path: str,
    socketio_client: SocketIOTestClient,
    run_watch_db: None,  # pylint: disable=unused-argument
) -> None:
    """Emits a SocketIO event when the database is deleted."""
    assert len(socketio_client.get_received()) == 0

    # Explicitly close DB to avoid Windows permission error
    db = cast(ParamDB[Any], socketio_client.app.config["db"])
    db._engine.dispose()  # pylint: disable=protected-access

    os.remove(db_path)
    received = wait_for_socketio_events(socketio_client)
    assert len(received) == 1
    assert received[0]["name"] == "database_update"


def test_emits_on_move(
    db_path: str,
    socketio_client: SocketIOTestClient,
    run_watch_db: None,  # pylint: disable=unused-argument
) -> None:
    """Emits a SocketIO event when the database is moved/renamed."""
    assert len(socketio_client.get_received()) == 0

    # Explicitly close DB to avoid Windows permission error
    db = cast(ParamDB[Any], socketio_client.app.config["db"])
    db._engine.dispose()  # pylint: disable=protected-access

    os.rename(db_path, f"{db_path}-moved")
    received = wait_for_socketio_events(socketio_client)
    assert len(received) == 1
    assert received[0]["name"] == "database_update"
