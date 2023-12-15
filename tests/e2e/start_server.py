"""Script to reset the database and start the server for E2E testing."""

from paramview import start_server
from tests.e2e.helpers import DB_PATH, reset_db

if __name__ == "__main__":
    reset_db()
    start_server(DB_PATH, default_port=5051, open_window=False)
