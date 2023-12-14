"""Helper functions for E2E tests."""

from __future__ import annotations
from typing import Any
from collections.abc import Callable
import time
import signal
import subprocess
from datetime import datetime, timedelta, timezone
import requests  # type: ignore
from sqlalchemy import delete
from freezegun import freeze_time
import astropy.units as u  # type: ignore
from paramdb import ParamDB, Param, Struct, ParamList, ParamDict
from paramdb._database import _Snapshot


_SERVER_POLLING_WAIT = 0.1
_SERVER_POLLING_MAX_RETRIES = int(5 / _SERVER_POLLING_WAIT)
_SERVER_REQUEST_TIMEOUT = 1.0
_START_DATE = datetime(2023, 1, 1, tzinfo=timezone.utc).astimezone()


class _CustomParam(Param):
    int: int
    str: str


class _CustomStruct(Struct):
    int: int
    str: str
    param: _CustomParam


def get_date(commit_id: int) -> datetime:
    """Get the date corresponding to the given commit ID."""
    return _START_DATE + timedelta(days=commit_id - 1)


def datetime_to_input_str(datetime_obj: datetime) -> str:
    """Format the datetime object in HTML datetime-local input format."""
    return datetime_obj.astimezone().strftime("%Y-%m-%dT%H:%M")


def clear(db: ParamDB[Any]) -> None:
    """Clear the database."""
    with db._Session.begin() as session:  # pylint: disable=no-member,protected-access
        session.execute(delete(_Snapshot))  # Clear all commits


def commit(
    db: ParamDB[Any], message: str | None = None, data: Any | None = None
) -> None:
    """Make a commit with the given message."""
    num_commits = db.num_commits
    commit_id = num_commits + 1
    message = f"Commit {commit_id}" if message is None else message
    data = ParamDict(commit_id=commit_id, b=2, c=3) if data is None else data
    with freeze_time(get_date(num_commits + 1)):
        db.commit(message, data)


def reset(db: ParamDB[Any], num_commits: int = 3) -> None:
    """Clear the database and make some initial commits."""
    clear(db)
    initial_data = ParamDict(
        {
            "commit_id": 1,
            "int": 123,
            "float": 1.2345,
            "bool": True,
            "str": "test",
            "None": None,
            "datetime": get_date(1),
            "Quantity": 1.2345 * u.m,
            "list": [123, "test"],
            "dict": {"int": 123, "str": "test"},
            "paramList": ParamList([123, "test"]),
            "paramDict": ParamDict(int=123, str="test"),
            "struct": _CustomStruct(
                int=123, str="test", param=_CustomParam(int=123, str="test")
            ),
            "param": _CustomParam(int=123, str="test"),
        }
    )
    commit(db, "Initial commit", initial_data)
    for _ in range(2, num_commits + 1):
        commit(db)


def setup_db_and_start_server(
    db_path: str, port: int, base_url: str
) -> Callable[[], None]:
    """
    Set up the database, start the server, wait for the server to be up, and return a
    function to stop the server.
    """
    # Verify that the base url is available
    try:
        requests.get(base_url, timeout=_SERVER_REQUEST_TIMEOUT)
        raise RuntimeError(f"{base_url} is already in use.")
    except requests.ConnectionError:
        time.sleep(_SERVER_POLLING_WAIT)

    reset(ParamDB(db_path))

    # pylint: disable=consider-using-with
    server_process = subprocess.Popen(
        ["paramview", db_path, "--port", f"{port}", "--no-open"]
    )

    # Wait for server to be up
    for _ in range(_SERVER_POLLING_MAX_RETRIES):
        try:
            requests.get(base_url, timeout=_SERVER_REQUEST_TIMEOUT)
            break
        except requests.ConnectionError:
            time.sleep(_SERVER_POLLING_WAIT)

    def stop_server() -> None:
        server_process.send_signal(signal.SIGINT)

    return stop_server


def load_classes_from_db(db: ParamDB[Any]) -> None:
    """
    Load the last commit as Python classes. This helps to test that objects are
    formatted properly, in particular datetime and Quantity objects.
    """
    db.load()
