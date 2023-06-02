"""Script to perform actions relating to the backend."""

from __future__ import annotations
from typing import Any
import os
import argparse
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete
from freezegun import freeze_time
import astropy.units as u  # type: ignore
from paramdb import ParamDB, Param, Struct, ParamList, ParamDict
from paramdb._database import _Snapshot


DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "param.db")
db = ParamDB[Any](DB_PATH)


class CustomStruct(Struct):
    int: int
    str: str
    param: CustomParam


class CustomParam(Param):
    int: int
    str: str


def start() -> None:
    """Reset the database and start the server."""
    # This takes a small amount of time to import, so this slightly optimizes the speed
    # of tests, which do not call the start command and therefore do not need to import
    # paramview.
    from paramview import start_server  # pylint: disable=import-outside-toplevel

    reset()
    start_server(DB_PATH, auto_open=False)


def reset(single: bool = False, long: bool = False) -> None:
    """Clear the database and make some initial commits."""
    if single:
        num_commits = 1
    elif long:
        num_commits = 100
    else:
        num_commits = 3
    clear()
    date = datetime(2023, 1, 1, tzinfo=timezone.utc).astimezone()
    initial_data = ParamDict(
        {
            "commit_id": 1,
            "int": 123,
            "float": 1.2345,
            "bool": True,
            "str": "test",
            "None": None,
            "datetime": date,
            "Quantity": 1.2345 * u.m,
            "list": [123, "test"],
            "dict": {"int": 123, "str": "test"},
            "paramList": ParamList([123, "test"]),
            "paramDict": ParamDict(int=123, str="test"),
            "struct": CustomStruct(
                int=123, str="test", param=CustomParam(int=123, str="test")
            ),
            "param": CustomParam(int=123, str="test"),
        }
    )
    with freeze_time(date):
        db.commit("Initial commit", initial_data)
    for commit_id in range(2, num_commits + 1):
        date += timedelta(days=1)
        updated_data = ParamDict(commit_id=commit_id, b=2, c=3)
        with freeze_time(date):
            db.commit(f"Commit {commit_id}", updated_data)


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


def load_classes() -> None:
    """
    Load the last commit as Python classes. This helps to test that objects are
    formatted properly, in particular datetime and Quantity objects.
    """
    db.load()


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
        "--single", action="store_true", help="only make a single commit"
    )
    parser_reset.add_argument(
        "--long", action="store_true", help="create a long commit history"
    )
    parser_reset.set_defaults(func=lambda args: reset(args.single, args.long))
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
    parser_commit = subparsers.add_parser(
        "load_classes",
        help="load the last commit using Python classes",
    )
    parser_commit.set_defaults(func=lambda args: load_classes())
    args = parser.parse_args()
    args.func(args)
