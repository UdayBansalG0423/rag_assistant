from fastapi import APIRouter, Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.auth import (
    CurrentUserResponse,
    LoginRequest,
    LoginResponse,
    SignUpRequest,
    SignUpResponse,
)
from app.services.auth.auth_service import (
    get_current_user,
    refresh_token,
    signup,
)
from app.core.rate_limiter import limiter


router = APIRouter()
security = HTTPBearer()


@router.post("/auth/register", response_model=SignUpResponse, status_code=201)
@router.post("/auth/signup", response_model=SignUpResponse, status_code=201)
@limiter.limit("5/minute")
async def signup_route(request: Request, payload: SignUpRequest):
    return await signup(payload)


@router.post("/auth/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login_route(request: Request, payload: LoginRequest):
    from app.services.auth.auth_service import login

    return await login(payload)


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return await get_current_user(credentials.credentials)


@router.post("/auth/refresh")
async def refresh_token_route(refresh_token_str: str):
    return await refresh_token(refresh_token_str)


@router.post("/auth/logout")
async def logout_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    from app.services.auth.auth_service import get_current_user
    from app.core.logger import get_logger

    logger = get_logger(__name__)
    user_id = None
    try:
        user = await get_current_user(credentials.credentials)
        user_id = user.id
    except Exception:
        # token invalid or missing; still return success for idempotency
        pass

    logger.info("logout", extra={"user_id": user_id})
    return {"message": "Logged out successfully"}
