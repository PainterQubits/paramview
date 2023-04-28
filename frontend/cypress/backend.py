"""Script to perform actions relating to the backend."""

from typing import Any
import os
import argparse
from sqlalchemy import delete
from paramdb import ParamDB, ParamDict
from paramdb._database import _Snapshot


DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "param.db")
db = ParamDB[Any](DB_PATH)


def start() -> None:
    """Reset the database and start the server."""
    # This takes a small amount of time to import, so this slightly optimizes the speed
    # of tests, which do not call the start command and therefore do not need to import
    # paramview.
    from paramview import start_server  # pylint: disable=import-outside-toplevel

    reset()
    start_server(DB_PATH, auto_open=False)


def reset() -> None:
    """Clear the database and make some initial commits."""
    clear()
    db.commit("Initial commit", ParamDict(a=1, b=2, c=3))
    db.commit("Second commit", ParamDict(a=3, b=2, c=3))
    db.commit("Third commit", ParamDict(a=1.2345, b=2, c=3))


def clear() -> None:
    """Clear the database."""
    with db._Session.begin() as session:  # pylint: disable=no-member,protected-access
        session.execute(delete(_Snapshot))  # Clear all commits


def commit(message: str) -> None:
    """Make a commit with the given message."""
    db.commit(message, ParamDict(a=1, b=2, c=3))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title="commands")

    parser_start = subparsers.add_parser(
        "start",
        help="reset the database and start the backend server",
    )
    parser_start.set_defaults(func=lambda args: start())

    parser_reset = subparsers.add_parser(
        "reset",
        help="clear the database and make some initial commits",
    )
    parser_reset.set_defaults(func=lambda args: reset())

    parser_clear = subparsers.add_parser(
        "clear",
        help="clear the database",
    )
    parser_clear.set_defaults(func=lambda args: clear())

    parser_commit = subparsers.add_parser(
        "commit",
        help="make a commit with the given message",
    )
    parser_commit.add_argument("message", metavar="<message>", help="commit message")
    parser_commit.set_defaults(func=lambda args: commit(args.message))

    args = parser.parse_args()
    args.func(args)
