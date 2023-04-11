"""Function to watch the database and emit a SocketIO event when it is updated."""


from typing import Callable
import os
from threading import Event
from eventlet import tpool, spawn  # type: ignore
from flask_socketio import SocketIO  # type: ignore
from watchdog.observers import Observer
from watchdog.events import FileSystemEvent, FileSystemEventHandler

database_update_event = Event()


class _DBEventHandler(FileSystemEventHandler):
    def __init__(self, db_dir: str, db_name: str, socketio: SocketIO):
        self._db_path = os.path.join(db_dir, db_name)
        self._socketio = socketio

    def _emit_database_update(self) -> None:
        database_update_event.set()

    def dispatch(self, event: FileSystemEvent) -> None:
        if (
            event.src_path == self._db_path
            or event.src_path == f"{self._db_path}-journal"
        ):
            super().dispatch(event)  # type: ignore

    def on_moved(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_created(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_deleted(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_modified(self, event: FileSystemEvent) -> None:
        self._emit_database_update()


def _wait_for_database_update() -> None:
    database_update_event.wait()
    database_update_event.clear()


def watch_db(db_path: str, socketio: SocketIO) -> Callable[[], None]:
    """
    Watch the database and emit the SocketIO event ``"database updated"`` when it is
    modified. Return a function that should be called to stop the observer thread.
    """
    db_dir, db_name = os.path.split(os.path.abspath(db_path))
    event_handler = _DBEventHandler(db_dir, db_name, socketio)
    observer = Observer()
    observer.schedule(event_handler, db_dir)  # type: ignore
    observer.start()  # type: ignore

    spawn(watch_db_helper, socketio)

    def stop_watch_db() -> None:
        observer.stop()  # type: ignore
        observer.join()

    return stop_watch_db


def watch_db_helper(socketio: SocketIO) -> None:
    while True:
        tpool.execute(_wait_for_database_update)
        print("Updated")
        socketio.emit("database_update")
