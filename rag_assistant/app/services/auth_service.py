from app.core.supabase_client import supabase, supabase_admin
from pydantic import BaseModel, EmailStr
from fastapi import HTTPException
from datetime import datetime

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
    """
    Sign up a new user with Supabase Auth and create profile
    
    Flow:
    1. Create auth user via Supabase Auth
    2. Insert profile into profiles table
    """
    try:
        # Step A: Create auth user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "name": request.name
                }
            }
        })
        
        user_id = auth_response.user.id
        
        # Step B: Insert into profiles table
        profile_response = supabase.table("profiles").insert({
            "id": user_id,
            "email": request.email,
            "name": request.name,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        return SignUpResponse(
            message="Signup successful. Please check your email to verify your account.",
            user_id=user_id,
            email=request.email,
            name=request.name
        )
    
    except Exception as e:
        error_msg = str(e)
        if "already exists" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_msg}")


async def login(request: LoginRequest) -> LoginResponse:
    """
    Login user with Supabase Auth
    
    Returns JWT tokens and user info
    """
    try:
        # Authenticate with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
        
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get user profile for extra info
        profile = supabase.table("profiles").select("*").eq("id", response.user.id).single().execute()
        
        return LoginResponse(
            access_token=response.session.access_token,
            refresh_token=response.session.refresh_token,
            user_id=response.user.id,
            email=response.user.email or request.email,
            token_type="bearer"
        )
    
    except Exception as e:
        error_msg = str(e)
        if "invalid login credentials" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=401, detail="Login failed")


async def get_current_user(token: str) -> CurrentUserResponse:
    """
    Verify JWT token and return current user info from Supabase
    """
    try:
        # Get user from token
        user = supabase.auth.get_user(token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get additional profile data
        try:
            profile = supabase.table("profiles").select("*").eq("id", user.id).single().execute()
            profile_data = profile.data
            name = profile_data.get("name") if profile_data else None
        except:
            name = user.user_metadata.get("name") if user.user_metadata else None
        
        return CurrentUserResponse(
            id=user.id,
            email=user.email,
            name=name
        )
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    """
    try:
        response = supabase.auth.refresh_session(refresh_token)
        
        if not response.session:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        return {
            "access_token": response.session.access_token,
            "refresh_token": response.session.refresh_token,
            "token_type": "bearer"
        }
    
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token refresh failed")
