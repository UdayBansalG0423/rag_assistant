from fastapi import APIRouter, Depends
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


router = APIRouter()
security = HTTPBearer()


@router.post("/auth/signup", response_model=SignUpResponse, status_code=201)
async def signup_route(request: SignUpRequest):
    return await signup(request)


@router.post("/auth/login", response_model=LoginResponse)
async def login_route(request: LoginRequest):
    from app.services.auth.auth_service import login

    return await login(request)


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return await get_current_user(credentials.credentials)


@router.post("/auth/refresh")
async def refresh_token_route(refresh_token_str: str):
    return await refresh_token(refresh_token_str)


@router.post("/auth/logout")
async def logout_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    return {"message": "Logged out successfully"}
