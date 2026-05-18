import asyncio
import time
from dotenv import load_dotenv
import pathlib

# Ensure .env is loaded before importing app modules
proj_root = pathlib.Path(__file__).resolve().parents[1]
env_path = proj_root.joinpath('.env')
load_dotenv(env_path)

from app.services import auth_service
from app.services.auth_service import SignUpRequest, LoginRequest

async def run_test():
    ts = int(time.time())
    email = f"test+copilot{ts}@example.com"
    password = "TestPass123!"
    name = "Copilot Test"

    print("Testing signup for:", email)
    try:
        signup_resp = await auth_service.signup(SignUpRequest(name=name, email=email, password=password))
        print("Signup response:", signup_resp)
    except Exception as e:
        print("Signup error:", e)

    print("Attempting login")
    try:
        login_resp = await auth_service.login(LoginRequest(email=email, password=password))
        print("Login response:", login_resp)
    except Exception as e:
        print("Login error:", e)
        return

    access_token = login_resp.access_token
    print("Calling get_current_user with access token")
    try:
        current = await auth_service.get_current_user(access_token)
        print("Current user:", current)
    except Exception as e:
        print("Get current user error:", e)

if __name__ == '__main__':
    asyncio.run(run_test())
