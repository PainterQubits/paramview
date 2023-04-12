"""Tests for the CLI."""

from importlib.metadata import distribution
import pytest
from pytest import CaptureFixture
from paramview._cli import _parse_args

PROGRAM_NAME = "paramview"
DB_PATH = "test.db"
VERSION_MSG = f"{PROGRAM_NAME} {distribution(PROGRAM_NAME).version}"
USAGE_MSG = f"usage: {PROGRAM_NAME} [-h] [-V] [-p PORT] <database path>"
POSITIONAL_ARGS_MSG = """
positional arguments:
  <database path>       path to the ParamDB database file
"""
OPTIONAL_ARGS_MSG = """
options:
  -h, --help            show this help message and exit
  -V, --version         show program's version number and exit
  -p PORT, --port PORT  port to use (default is 5050)
"""
ERROR_MSG = f"{PROGRAM_NAME}: error:"
REQUIRED_MSG = "the following arguments are required: <database path>"
UNRECOGNIZED_MSG = "unrecognized arguments:"


def _sw(*strings: str) -> str:
    """
    Standardize whitespace by joining the given strings and converting all whitespace
    between words to single spaces.
    """
    return " ".join(" ".join(strings).split())


def test_db_path() -> None:
    """Parses the database path."""
    args = _parse_args(DB_PATH)
    assert args.db_path == DB_PATH


def test_port_default() -> None:
    """Default port is 5050."""
    args = _parse_args(DB_PATH)
    assert args.port == 5050


@pytest.mark.parametrize("port_arg", ["--port", "-p"])
def test_port(port_arg: str) -> None:
    """Parses the port."""
    args = _parse_args(DB_PATH, port_arg, "1234")
    assert args.port == 1234


@pytest.mark.parametrize("version_arg", ["--version", "-V"])
def test_version(version_arg: str, capsys: CaptureFixture[str]) -> None:
    """Prints version message to stdout and exists with code 0."""
    with pytest.raises(SystemExit) as exc_info:
        _parse_args(version_arg)
    assert exc_info.value.code == 0
    assert _sw(capsys.readouterr().out) == _sw(VERSION_MSG)


@pytest.mark.parametrize("help_arg", ["--help", "-h"])
def test_help(help_arg: str, capsys: CaptureFixture[str]) -> None:
    """Prints help message to stdout and exists with code 0."""
    with pytest.raises(SystemExit) as exc_info:
        _parse_args(help_arg)
    assert exc_info.value.code == 0
    assert _sw(capsys.readouterr().out) == _sw(
        USAGE_MSG, POSITIONAL_ARGS_MSG, OPTIONAL_ARGS_MSG
    )


def test_no_args(capsys: CaptureFixture[str]) -> None:
    """Prints required argument message to stderr and exits with code 2."""
    with pytest.raises(SystemExit) as exc_info:
        _parse_args()
    assert exc_info.value.code == 2
    assert _sw(capsys.readouterr().err) == _sw(USAGE_MSG, ERROR_MSG, REQUIRED_MSG)


@pytest.mark.parametrize("unrecognized_arg", ["arg", "--arg", "-a"])
def test_parse_args_unrecognized(
    unrecognized_arg: str, capsys: CaptureFixture[str]
) -> None:
    """Prints message to stderr and exits with code 2."""
    with pytest.raises(SystemExit) as excinfo:
        _parse_args(DB_PATH, unrecognized_arg)
    assert excinfo.value.code == 2
    assert _sw(capsys.readouterr().err) == _sw(
        USAGE_MSG, ERROR_MSG, UNRECOGNIZED_MSG, unrecognized_arg
    )
