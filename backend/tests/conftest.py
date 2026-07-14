import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_supabase_client(mocker):
    # Mock where it's used, not where it's defined
    return mocker.patch("app.core.progress.supabase_admin")
