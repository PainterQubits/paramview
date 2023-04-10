"""WSGI server."""

from typing import cast
import os
import sys
import socket
import mimetypes
import webbrowser
from flask_socketio import SocketIO  # type: ignore
from paramview._app import create_app

# Fix JavaScript MIME type for Windows
mimetypes.add_type("text/javascript", ".js")


def _available_port(host: str, default_port: int) -> int:
    sock = socket.socket()
    if os.name == "posix":
        # On POSIX platforms, this flag is set to immediately reuse previous sockets
        # See note at https://docs.python.org/3/library/socket.html#socket.create_server
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, True)
    try:
        sock.bind((host, default_port))
        return default_port
    except OSError:
        sock.bind((host, 0))
        available_port = sock.getsockname()[1]
        print(f"Port {default_port} is in use.", end=" ", file=sys.stderr)
        return int(available_port)
    finally:
        sock.close()


def start_server(
    db_path: str, host: str = "127.0.0.1", default_port: int = 5050
) -> None:
    """
    Start the server locally on the given port using SocketIO, and open in a new browser
    window. If the given port is in use, find another available port.
    """
    app = create_app(db_path)
    socketio = cast(SocketIO, app.config["socketio"])
    port = _available_port(host, default_port)
    webbrowser.open(f"http://{host}:{port}", new=2)
    print(f"Serving on http://{host}:{port}", file=sys.stderr)
    socketio.run(app, host, port)
