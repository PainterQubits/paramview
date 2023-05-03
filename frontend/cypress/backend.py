"""Script to perform actions relating to the backend."""

from typing import Any
import os
import argparse
from datetime import datetime, timedelta
from sqlalchemy import delete
from freezegun import freeze_time
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


def reset(long: bool = False) -> None:
    """Clear the database and make some initial commits."""
    num_commits = 100 if long else 3
    clear()
    date = datetime(2023, 1, 1)
    with freeze_time(date):
        db.commit("Initial commit", ParamDict(commit_id=1, b=2, c=3))
    for commit_id in range(2, num_commits + 1):
        date += timedelta(days=1)
        with freeze_time(date):
            db.commit(f"Commit {commit_id}", ParamDict(commit_id=commit_id, b=2, c=3))


def clear() -> None:
    """Clear the database."""
    with db._Session.begin() as session:  # pylint: disable=no-member,protected-access
        session.execute(delete(_Snapshot))  # Clear all commits


def commit() -> None:
    """Make a commit with the given message."""
    num_commits = db.num_commits
    commit_id = num_commits + 1
    with freeze_time(datetime(2023, 1, 1) + timedelta(days=num_commits)):
        db.commit(f"Commit {commit_id}", ParamDict(commit_id=commit_id, b=2, c=3))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(title="commands", required=True)
    parser_start = subparsers.add_parser(
        "start",
        help="reset the database and start the backend server",
    )
    parser_start.set_defaults(func=lambda args: start())
    parser_reset = subparsers.add_parser(
        "reset",
        help="clear the database and make some initial commits",
    )
    parser_reset.add_argument(
        "--long", action="store_true", help="create a long commit history"
    )
    parser_reset.set_defaults(func=lambda args: reset(args.long))
    parser_clear = subparsers.add_parser(
        "clear",
        help="clear the database",
    )
    parser_clear.set_defaults(func=lambda args: clear())
    parser_commit = subparsers.add_parser(
        "commit",
        help="make a commit with the given message",
    )
    parser_commit.set_defaults(func=lambda args: commit())
    args = parser.parse_args()
    args.func(args)
