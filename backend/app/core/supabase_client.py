from dotenv import load_dotenv
import pathlib
import os

# First attempt a standard load (searches CWD and parents)
load_dotenv()

# If required vars are still missing, try to explicitly load the project's .env
env_url = os.getenv("SUPABASE_URL")
env_key = os.getenv("SUPABASE_ANON_KEY")
if not env_url or not env_key:
    # supabase_client.py is at app/core; project root is two levels up
    project_root = pathlib.Path(__file__).resolve().parents[2]
    explicit = project_root.joinpath('.env')
    if explicit.exists():
        load_dotenv(explicit)

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
# If user provided REST endpoint format, strip to project base URL.
# Handles both .../rest/v1 and .../rest/v1/.
if SUPABASE_URL.endswith("/rest/v1"):
    SUPABASE_URL = SUPABASE_URL[: -len("/rest/v1")]

SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise EnvironmentError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env")

# Anon client for frontend-initiated auth (signup, login)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Service role client for server-side operations (admin tasks)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else supabase