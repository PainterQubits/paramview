"""Command-line interface to start ParamView."""

from argparse import Namespace, ArgumentParser
from importlib.metadata import distribution
from paramview._server import start_server

PACKAGE_NAME = "paramview"
VERSION = distribution(PACKAGE_NAME).version


def parse_args() -> Namespace:
    """Parse command line arguments using argparse."""
    parser = ArgumentParser()
    parser.add_argument(
        "-V",
        "--version",
        action="version",
        version=f"{PACKAGE_NAME} {VERSION}",
    )
    parser.add_argument(
        "db_path",
        metavar="<ParamDB path>",
        type=str,
        help="path to the ParamDB database file",
    )
    return parser.parse_args()


def main() -> None:
    """Parse command line arguments and start the server."""
    parse_args()
    start_server()
