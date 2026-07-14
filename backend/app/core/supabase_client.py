from supabase import create_client, Client
from app.core.config import settings

SUPABASE_URL = settings.SUPABASE_URL
# If user provided REST endpoint format, strip to project base URL.
# Handles both .../rest/v1 and .../rest/v1/.
if SUPABASE_URL.endswith("/rest/v1"):
    SUPABASE_URL = SUPABASE_URL[: -len("/rest/v1")]

SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY = settings.SUPABASE_SERVICE_KEY

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise EnvironmentError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment")

# Anon client for frontend-initiated auth (signup, login)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# Service role client for server-side operations (admin tasks)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY) if SUPABASE_SERVICE_KEY else supabase