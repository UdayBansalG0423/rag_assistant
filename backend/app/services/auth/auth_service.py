from datetime import datetime

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr

from app.core.supabase_client import supabase, supabase_admin
from app.core.logger import get_logger

logger = get_logger(__name__)


security = HTTPBearer()


class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class SignUpResponse(BaseModel):
    message: str
    user_id: str
    email: str
    name: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: str
    email: str
    token_type: str = "bearer"


class CurrentUserResponse(BaseModel):
    id: str
    email: str
    name: str | None


async def signup(request: SignUpRequest) -> SignUpResponse:
    try:
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {"data": {"name": request.name}},
        })

        user_id = auth_response.user.id

        supabase.table("profiles").insert({
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "created_at": datetime.utcnow().isoformat(),
        }).execute()

        return SignUpResponse(
            message="Signup successful. Please check your email to verify your account.",
            user_id=user_id,
            email=request.email,
            name=request.name,
        )
    except Exception as exc:
        logger.exception("signup_failed", extra={"email": request.email})
        error_msg = str(exc)
        if "already exists" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_msg}")


async def login(request: LoginRequest) -> LoginResponse:
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })

        if not response.session:
            logger.warning("login_failure", extra={"email": request.email})
            raise HTTPException(status_code=401, detail="Invalid credentials")

        supabase.table("profiles").select("*").eq("id", response.user.id).single().execute()

        logger.info("login_success", extra={"user_id": response.user.id, "email": response.user.email or request.email})

        return LoginResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=response.user.id,
            email=response.user.email or request.email,
            token_type="bearer",
        )
    except Exception:
        logger.exception("login_exception", extra={"email": request.email})
        raise HTTPException(status_code=401, detail="Login failed")


async def get_current_user(token: str) -> CurrentUserResponse:
    try:
        user_response = supabase.auth.get_user(token)
        user = getattr(user_response, "user", None) or user_response

        user_id = getattr(user, "id", None)
        user_email = getattr(user, "email", None)

        if not user_id:
            logger.warning("token_validation_failed", extra={"token": token})
            raise HTTPException(status_code=401, detail="Invalid token")

        try:
            profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
            profile_data = profile.data
            name = profile_data.get("name") if profile_data else None
        except Exception:
            user_metadata = getattr(user, "user_metadata", None) or {}
            name = user_metadata.get("name")

        return CurrentUserResponse(id=user_id, email=user_email or "", name=name)
    except Exception:
        logger.exception("token_validation_exception")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user_from_credentials(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> CurrentUserResponse:
    return await get_current_user(credentials.credentials)


async def refresh_token(refresh_token: str):
    try:
        response = supabase.auth.refresh_session(refresh_token)

        if not response.session:
            logger.warning("refresh_token_failed", extra={"refresh_token": refresh_token})
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        logger.info("refresh_token_success", extra={})
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer",
        }
    except Exception:
        logger.exception("refresh_token_exception")
        raise HTTPException(status_code=401, detail="Token refresh failed")
