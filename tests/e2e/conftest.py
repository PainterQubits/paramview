"""
Setup and global fixtures for E2E tests.

Called automatically by Pytest before running tests.
"""

from typing import Any
from collections.abc import Generator
import pytest
from xdist import get_xdist_worker_id  # type: ignore
from playwright.sync_api import Page
from paramdb import ParamDB
from tests.e2e.helpers import setup_db_and_start_server, clear, reset


HOST = "http://127.0.0.1"
STARTING_PORT = 7000  # xdist workers will increment up from this port


@pytest.fixture(name="port", scope="session")
def fixture_port(request: pytest.FixtureRequest) -> int:
    """Port to run ParamView server on, unique to the current xdist worker."""
    worker_id = get_xdist_worker_id(request)
    if worker_id == "master":
        port_offset = 0
    else:
        assert worker_id[:2] == "gw"
        port_offset = int(worker_id[2:])
    return STARTING_PORT + port_offset


@pytest.fixture(name="base_url", scope="session")
def fixture_base_url(port: int) -> str:
    """Base URL for ParamView."""
    return f"{HOST}:{port}"


@pytest.fixture(name="_visit_page")
def fixture_visit_page(page: Page, base_url: str) -> None:
    """Visits the page."""
    page.goto(base_url)


@pytest.fixture(name="db_name", scope="session")
def fixture_db_name() -> str:
    """Database file name."""
    return "param.db"


@pytest.fixture(name="db_path", scope="session")
def fixture_db_path(
    tmp_path_factory: pytest.TempPathFactory, port: int, base_url: str, db_name: str
) -> Generator[str, None, None]:
    """
    Path to the ParamDB database. The ParamView server for the database is also started
    and cleaned up by this fixture.
    """
    db_path = str(tmp_path_factory.mktemp("db") / db_name)
    stop_server = setup_db_and_start_server(db_path, port, base_url)
    yield db_path
    stop_server()


@pytest.fixture(name="db")
def fixture_db(db_path: str) -> ParamDB[Any]:
    """ParamDB database."""
    return ParamDB[Any](db_path)


@pytest.fixture(name="_clear_db")
def fixture_clear_db(db: ParamDB[Any]) -> None:
    """Clears the database."""
    clear(db)


@pytest.fixture(name="_reset_db")
def fixture_reset_db(db: ParamDB[Any]) -> None:
    """Resets the database."""
    reset(db)


@pytest.fixture(name="_reset_single_db")
def fixture_reset_single_db(db: ParamDB[Any]) -> None:
    """Resets the database to have a single commit."""
    reset(db, num_commits=1)


@pytest.fixture(name="_reset_long_db")
def fixture_reset_long_db(db: ParamDB[Any]) -> None:
    """Resets the database to have 100 commits."""
    reset(db, num_commits=100)
