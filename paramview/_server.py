"""WSGI server."""

import os
import sys
import socket
import mimetypes
import webbrowser
import waitress
from paramview._app import create_app

# Fix JavaScript MIME type for Windows
mimetypes.add_type("text/javascript", ".js")


def start_server(
    db_path: str, host: str = "127.0.0.1", default_port: int = 5050
) -> None:
    """
    Start the server locally on the given port using Waitress, and open in a new
    browser window. If the given port is in use, find another available port.
    """
    app = create_app(db_path)
    port = default_port
    sock = socket.socket()
    if os.name == "posix":
        # On POSIX platforms, this flag is set to immediately reuse previous sockets
        # See note at https://docs.python.org/3/library/socket.html#socket.create_server
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, True)
    try:
        sock.bind((host, port))
    except OSError:
        sock.bind((host, 0))
        port = sock.getsockname()[1]
        print(f"Port {default_port} is in use.", end=" ", file=sys.stderr)
    webbrowser.open(f"http://{host}:{port}", new=2)
    print(f"Serving on http://{host}:{port}", file=sys.stderr)
    waitress.serve(app, sockets=[sock], threads=6)
    sock.close()
