Fault tolerance tests

Purpose: Simulate failures in Redis/Celery and verify retry logic, task idempotency, and progress reporting.

Notes:
- Include tests that simulate Redis connection loss, Celery task retries, and malformed task payloads.
- Use fixtures to control timeouts and simulate backoff.
