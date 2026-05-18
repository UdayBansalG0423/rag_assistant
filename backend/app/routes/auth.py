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
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.services.auth_service import (
    signup, 
    login, 
    get_current_user,
    refresh_token,
    SignUpRequest,
    LoginRequest,
    SignUpResponse,
    LoginResponse,
    CurrentUserResponse
)

router = APIRouter()
security = HTTPBearer()

@router.post("/auth/signup", response_model=SignUpResponse, status_code=201)
async def signup_route(request: SignUpRequest):
    """
    Register a new user with email and password
    
    Creates both Supabase Auth user and profile record
    """
    return await signup(request)

@router.post("/auth/login", response_model=LoginResponse)
async def login_route(request: LoginRequest):
    """
    Login with email and password
    
    Returns access_token, refresh_token, and user info
    """
    return await login(request)

@router.get("/me", response_model=CurrentUserResponse)
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current authenticated user information
    
    Requires valid JWT token in Authorization header
    """
    return await get_current_user(credentials.credentials)

@router.post("/auth/refresh")
async def refresh_token_route(refresh_token_str: str):
    """
    Refresh access token using refresh token
    """
    return await refresh_token(refresh_token_str)

@router.post("/auth/logout")
async def logout_route(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout endpoint (token stored client-side, so logout is just removing token from frontend)
    """
    return {"message": "Logged out successfully"}