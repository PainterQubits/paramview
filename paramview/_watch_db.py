"""Function to watch the database and emit a SocketIO event when it is updated."""

from __future__ import annotations
from typing import Callable
import os
from threading import Event, Condition
from eventlet import tpool, spawn  # type: ignore
from flask_socketio import SocketIO  # type: ignore
from watchdog.observers import Observer
from watchdog.events import FileSystemEvent, FileSystemEventHandler


class _DBEventHandler(FileSystemEventHandler):
    """Watchdog event handler for watching the ParamDB file."""

    # pylint: disable-next=too-many-arguments
    def __init__(
        self,
        db_dir: str,
        db_name: str,
        watch_db_condition: Condition,
        db_update_event: Event,
    ):
        self._db_path = os.path.join(db_dir, db_name)
        self._watch_db_condition = watch_db_condition
        self._db_update_event = db_update_event

    def _db_update(self) -> None:
        """
        Register that the database has been updated by seting the database update event
        and notify threads waiting on the condition variable.
        """
        with self._watch_db_condition:
            self._db_update_event.set()
            self._watch_db_condition.notify()

    def dispatch(self, event: FileSystemEvent) -> None:
        # Only dispatch events that match the database path with or without the
        # SQLite "-journal" suffix. On macOS, it appears that only the journal file
        # triggers Watchdog on a database write.
        if event.src_path == f"{self._db_path}-journal":
            super().dispatch(event)  # type: ignore

    def on_deleted(self, event: FileSystemEvent) -> None:
        # Triggers an update if the database file was deleted, or if the database
        # journal file was deleted, which indicates a commit may have occured.
        self._db_update()


def _wait_for_db_update(
    watch_db_condition: Condition, db_update_event: Event, stop_watch_db_event: Event
) -> None:
    with watch_db_condition:
        while not db_update_event.is_set() and not stop_watch_db_event.is_set():
            watch_db_condition.wait()
        db_update_event.clear()


def _watch_db_helper(
    watch_db_condition: Condition,
    db_update_event: Event,
    stop_watch_db_event: Event,
    socketio: SocketIO,
) -> None:
    while not stop_watch_db_event.is_set():
        tpool.execute(
            _wait_for_db_update,
            watch_db_condition,
            db_update_event,
            stop_watch_db_event,
        )
        socketio.emit("database_update")


def watch_db(db_path: str, socketio: SocketIO) -> Callable[[], None]:
    """
    Watch the database and emit the SocketIO event ``"database updated"`` when it is
    modified. Return a function that should be called to stop the observer thread.
    """
    db_dir, db_name = os.path.split(os.path.abspath(db_path))
    watch_db_condition = Condition()
    db_update_event = Event()
    stop_watch_db_event = Event()
    event_handler = _DBEventHandler(
        db_dir, db_name, watch_db_condition, db_update_event
    )
    observer = Observer()
    observer.schedule(event_handler, db_dir)  # type: ignore
    observer.start()  # type: ignore
    watch_db_thread = spawn(
        _watch_db_helper,
        watch_db_condition,
        db_update_event,
        stop_watch_db_event,
        socketio,
    )

    def stop_watch_db() -> None:
        observer.stop()  # type: ignore
        with watch_db_condition:
            stop_watch_db_event.set()
            watch_db_condition.notify()
        watch_db_thread.wait()
        observer.join()

    return stop_watch_db
