import argparse
import json
import mimetypes
import os
import pathlib
import time
import uuid
from urllib import error, request

from dotenv import load_dotenv


def _post_json(url: str, payload: dict, headers: dict | None = None) -> tuple[int, dict]:
    raw = json.dumps(payload).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)

    req = request.Request(url=url, data=raw, headers=req_headers, method="POST")
    return _send(req)


def _post_multipart(url: str, fields: dict, files: dict, headers: dict | None = None) -> tuple[int, dict]:
    boundary = f"----NeuralDocBoundary{uuid.uuid4().hex}"
    body = bytearray()

    for name, value in fields.items():
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode("utf-8"))
        body.extend(str(value).encode("utf-8"))
        body.extend(b"\r\n")

    for field_name, file_info in files.items():
        filename, content, content_type = file_info
        body.extend(f"--{boundary}\r\n".encode("utf-8"))
        body.extend(
            f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'.encode("utf-8")
        )
        body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
        body.extend(content)
        body.extend(b"\r\n")

    body.extend(f"--{boundary}--\r\n".encode("utf-8"))

    req_headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    if headers:
        req_headers.update(headers)

    req = request.Request(url=url, data=bytes(body), headers=req_headers, method="POST")
    return _send(req)


def _get_json(url: str, headers: dict | None = None) -> tuple[int, dict]:
    req = request.Request(url=url, headers=headers or {}, method="GET")
    return _send(req)


def _send(req: request.Request) -> tuple[int, dict]:
    try:
        with request.urlopen(req, timeout=30) as resp:
            status_code = resp.status
            payload = resp.read().decode("utf-8")
            return status_code, json.loads(payload) if payload else {}
    except error.HTTPError as exc:
        payload = exc.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(payload)
        except Exception:
            parsed = {"error": payload}
        return exc.code, parsed


def main() -> int:
    parser = argparse.ArgumentParser(description="Test async PDF upload + Celery indexing flow.")
    parser.add_argument("--base-url", default=os.getenv("API_BASE_URL", "http://127.0.0.1:8000"))
    parser.add_argument("--email", default=os.getenv("TEST_USER_EMAIL"), help="User email for /auth/login")
    parser.add_argument("--password", default=os.getenv("TEST_USER_PASSWORD"), help="User password for /auth/login")
    parser.add_argument("--pdf", required=True, help="Path to a PDF file to upload")
    parser.add_argument("--timeout", type=int, default=300, help="Max seconds to wait for done/failed status")
    parser.add_argument("--poll-interval", type=float, default=2.0, help="Polling interval in seconds")
    args = parser.parse_args()

    backend_root = pathlib.Path(__file__).resolve().parents[1]
    load_dotenv(backend_root / ".env")

    if not args.email or not args.password:
        print("Missing credentials. Pass --email/--password or set TEST_USER_EMAIL/TEST_USER_PASSWORD.")
        return 1

    pdf_path = pathlib.Path(args.pdf)
    if not pdf_path.exists():
        print(f"PDF not found: {pdf_path}")
        return 1

    if pdf_path.suffix.lower() != ".pdf":
        print("Input file must be a .pdf")
        return 1

    base_url = args.base_url.rstrip("/")

    print("[1/3] Logging in...")
    login_status, login_data = _post_json(
        f"{base_url}/auth/login",
        {"email": args.email, "password": args.password},
    )
    if login_status != 200:
        print(f"Login failed ({login_status}): {login_data}")
        return 1

    access_token = login_data.get("access_token")
    if not access_token:
        print(f"Login succeeded but no access token in response: {login_data}")
        return 1

    headers = {"Authorization": f"Bearer {access_token}"}

    print("[2/3] Uploading PDF...")
    pdf_bytes = pdf_path.read_bytes()
    content_type = mimetypes.guess_type(pdf_path.name)[0] or "application/pdf"

    upload_status, upload_data = _post_multipart(
        f"{base_url}/upload",
        fields={},
        files={"file": (pdf_path.name, pdf_bytes, content_type)},
        headers=headers,
    )
    if upload_status not in (200, 201):
        print(f"Upload failed ({upload_status}): {upload_data}")
        return 1

    document_id = upload_data.get("id")
    if not document_id:
        print(f"Upload succeeded but no document id found: {upload_data}")
        return 1

    print(f"Upload accepted. document_id={document_id}")
    print("[3/3] Polling progress...")

    started = time.time()
    terminal_states = {"done", "failed", "error"}
    while time.time() - started < args.timeout:
        status_code, status_payload = _get_json(
            f"{base_url}/upload/status/{document_id}",
            headers=headers,
        )

        if status_code != 200:
            print(f"Status endpoint error ({status_code}): {status_payload}")
            return 1

        state = status_payload.get("status", "unknown")
        progress = status_payload.get("progress")
        print(f"status={state} progress={progress} payload={status_payload}")

        if state in terminal_states:
            if state == "done":
                print("SUCCESS: Async flow verified. Celery processed the task.")
                return 0
            print("FAILED: Indexing reached terminal error state.")
            return 1

        time.sleep(args.poll_interval)

    print(f"Timed out after {args.timeout}s waiting for terminal status.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())