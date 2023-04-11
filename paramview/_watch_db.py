"""Function to watch the database and emit a SocketIO event when it is updated."""

from typing import Callable
import os
from flask_socketio import SocketIO  # type: ignore
from watchdog.observers import Observer
from watchdog.events import FileSystemEvent, FileSystemEventHandler


class _DBEventHandler(FileSystemEventHandler):
    def __init__(self, db_dir: str, db_name: str):
        self._db_path = os.path.join(db_dir, db_name)
        self._socketio = SocketIO(message_queue="memory:///")

    def _emit_database_update(self) -> None:
        # self._socketio.emit("database_update")
        pass

    def dispatch(self, event: FileSystemEvent) -> None:
        if self._db_path == event.src_path:
            super().dispatch(event)  # type: ignore

    def on_moved(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_created(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_deleted(self, event: FileSystemEvent) -> None:
        self._emit_database_update()

    def on_modified(self, event: FileSystemEvent) -> None:
        self._emit_database_update()


def watch_db(db_path: str) -> Callable[[], None]:
    """
    Watch the database and emit the SocketIO event ``"database updated"`` when it is
    modified. Return a function that should be called to stop the observer thread.
    """
    db_dir, db_name = os.path.split(os.path.abspath(db_path))
    event_handler = _DBEventHandler(db_dir, db_name)
    observer = Observer()
    observer.schedule(event_handler, db_dir)  # type: ignore
    observer.start()  # type: ignore

    def stop_watch_db() -> None:
        observer.stop()  # type: ignore
        observer.join()

    return stop_watch_db
