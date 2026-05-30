import hashlib

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.responses import JSONResponse


def rate_limit_key(request: Request) -> str:
    authorization = request.headers.get("authorization")
    if authorization:
        token_hash = hashlib.sha256(authorization.encode("utf-8")).hexdigest()[:16]
        return f"auth:{token_hash}"

    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",", maxsplit=1)[0].strip()
        if client_ip:
            return f"ip:{client_ip}"

    return f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=rate_limit_key, headers_enabled=True)


def rate_limit_exceeded_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Too many requests. Please try again later."},
    )