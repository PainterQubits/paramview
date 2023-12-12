"""Tests for paramview._watch_db."""

from __future__ import annotations
from typing import Any
import time
from eventlet import sleep  # type: ignore
from flask_socketio import SocketIOTestClient  # type: ignore
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


def test_socketio_connected(socketio_client: SocketIOTestClient) -> None:
    """The server is connected to SocketIO."""
    assert socketio_client.is_connected()


def test_emits_on_update(
    db_path: str, db: ParamDB[Any], socketio_client: SocketIOTestClient
) -> None:
    """Emits a SocketIO event when the database is updated."""
    stop_watch_db = watch_db(db_path, socketio_client.socketio)
    assert len(socketio_client.get_received()) == 0
    db.commit("", 123)
    received = wait_for_socketio_events(socketio_client)
    assert len(received) == 1
    assert received[0]["name"] == "database_update"
    stop_watch_db()
