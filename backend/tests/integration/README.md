Integration tests

Purpose: End-to-end flows that exercise API endpoints through background workers and retrieval (e.g., upload -> indexing -> query).

Notes:
- Prefer lightweight fixtures that spin up components or mock external providers.
- Tag long-running tests with `@pytest.mark.integration`.
