"""Command-line interface to start ParamView."""

from __future__ import annotations
from argparse import ArgumentParser, Namespace
from importlib.metadata import distribution
from paramview._server import start_server

_PACKAGE_NAME = "paramview"
_VERSION = distribution(_PACKAGE_NAME).version


def _parse_args(*args: str) -> Namespace:
    """
    Parse command line arguments using argparse. If arguments are passed in, those are
    parsed instead of command line arguments.
    """
    parser = ArgumentParser(prog=_PACKAGE_NAME)
    parser.add_argument(
        "-V",
        "--version",
        action="version",
        version=f"{_PACKAGE_NAME} {_VERSION}",
    )
    parser.add_argument(
        "db_path",
        metavar="<database path>",
        help="path to the ParamDB database file",
    )
    parser.add_argument(
        "-p",
        "--port",
        default=5050,
        type=int,
        help="port to use (default is 5050)",
    )
    return parser.parse_args(args or None)


def main() -> None:
    """
    Parse command line arguments and start the server. The ``paramview`` command line
    program calls this function.
    """
    args = _parse_args()
    start_server(args.db_path, default_port=args.port)
