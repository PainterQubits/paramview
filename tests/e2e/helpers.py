"""Helper functions for E2E tests."""

from __future__ import annotations
from typing import Any
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from sqlalchemy import delete
from freezegun import freeze_time
import astropy.units as u  # type: ignore
from paramdb import ParamDB, Param, Struct, ParamList, ParamDict
from paramdb._database import _Snapshot


_START_DATETIME = datetime(2023, 1, 1, tzinfo=timezone.utc).astimezone()
DB_NAME = "param.db"
DB_PATH = os.path.join(os.path.dirname(__file__), DB_NAME)
_DB = ParamDB[Any](DB_PATH)


class CustomParam(Param):
    """Custom parameter."""

    int: int
    str: str


class CustomStruct(Struct):
    """Custom parameter structure."""

    int: int
    str: str
    param: CustomParam


def get_datetime(commit_id: int) -> datetime:
    """Get the datetime corresponding to the given commit ID."""
    return _START_DATETIME + timedelta(days=commit_id - 1)


def get_datetime_input(commit_id: int) -> str:
    """
    Get the datetime corresponding to the given commit ID in the format of HTML
    datetime-local input.
    """
    return get_datetime(commit_id).astimezone().strftime("%Y-%m-%dT%H:%M")


def get_datetime_display(commit_id: int) -> str:
    """
    Get the datetime corresponding to the given commit ID in the format dates are
    displayed in the app.
    """
    return get_datetime(commit_id).astimezone().strftime("%m/%d/%y, %I:%M:%S %p")


def get_commit_message(commit_id: int, message: str | None = None) -> str:
    """Get the commit message corresponding to the given commit ID."""
    if message is not None:
        return message
    if commit_id == 1:
        return "Initial commit"
    return f"Commit {commit_id}"


def get_commit_message_display(commit_id: int, message: str | None = None) -> str:
    """Get the commit message as displayed in the app."""
    return f"{commit_id}: {get_commit_message(commit_id, message)}"


def clear_db() -> None:
    """Clear the database."""
    with _DB._Session.begin() as session:  # pylint: disable=no-member,protected-access
        session.execute(delete(_Snapshot))  # Clear all commits


def commit_to_db(data: Any | None = None, message: str | None = None) -> None:
    """Make a commit with the given message."""
    num_commits = _DB.num_commits
    commit_id = num_commits + 1
    data = ParamDict(commit_id=commit_id, b=2, c=3) if data is None else data
    with freeze_time(get_datetime(num_commits + 1)):
        _DB.commit(get_commit_message(commit_id, message), data)


def reset_db(num_commits: int = 1) -> None:
    """Clear the database and make some initial commits."""
    clear_db()
    with freeze_time(get_datetime(1)):
        initial_data = ParamDict(
            {
                "commit_id": 1,
                "int": 123,
                "float": 1.2345,
                "bool": True,
                "str": "test",
                "None": None,
                "datetime": get_datetime(1),
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
    commit_to_db(initial_data)
    for _ in range(2, num_commits + 1):
        commit_to_db()


def load_classes_from_db() -> None:
    """
    Load the last commit as Python classes. This helps to test that objects are
    formatted properly, in particular datetime and Quantity objects.
    """
    _DB.load()


@dataclass
class CaptureDialogs:
    """Settings and captured values exposed by the ``capture_dialogs`` fixture."""

    accept: bool = False
    """Whether to accept subsequent dialogs (default is ``False``)."""
    num_dialogs: int = 0
    """Number of dialogs captured in the current test."""
    last_dialog_message: str | None = None
    """Message of the last dialog message captured."""


# pylint: disable-next=too-few-public-methods
class CommitInfo:
    """Information for a given commit."""

    def __init__(self, commit_id: int) -> None:
        self.id = commit_id
        self.date = get_datetime_display(commit_id)
        self.message = get_commit_message_display(commit_id)
