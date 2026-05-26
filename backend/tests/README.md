Phase 2 Test Structure

This folder contains tests organized by purpose for Phase 2 observability and reliability work.

Structure:

- integration/: End-to-end flows that exercise API -> worker -> retrieval pipelines.
- fault_tolerance/: Tests simulating Redis/Celery failures, retries, and recovery.
- uploads/: Tests for malformed, large, or edge-case PDF uploads and storage behavior.
- retrieval/: Validation tests for RAG retrieval correctness and ranking.
- health/: Service health and dependency checks (Redis, Pinecone, DB, etc.).

Run patterns:
- Use `pytest` with environment variables configured for test instances (or mocks).
- Keep tests hermetic when possible; prefer fixtures that mock external systems.
